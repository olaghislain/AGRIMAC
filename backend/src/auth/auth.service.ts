import { ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpPurpose, RoleCode, AccountStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomInt, randomUUID } from 'node:crypto';
import { normalizeBeninPhone } from '../common/auth/phone.util';
import { AccessTokenPayload, RefreshTokenPayload } from '../common/auth/auth.types';
import { LoginDto } from './dto/login.dto';
import { RequestOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const userInclude = {
  roles: { include: { role: true } },
  farmerProfile: true,
  companyProfile: true,
  technicianProfile: true,
  adminProfile: true,
} satisfies Prisma.UserInclude;

type UserWithProfile = Prisma.UserGetPayload<{ include: typeof userInclude }>;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly config: ConfigService) {}

  async register(dto: RegisterDto) {
    const phone = normalizeBeninPhone(dto.phone);
    if (dto.role === RoleCode.ADMINISTRATEUR) throw new ForbiddenException('La création d’un administrateur se fait depuis l’administration.');
    if (await this.prisma.user.findUnique({ where: { phone } })) throw new ConflictException('Ce numéro est déjà utilisé.');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const status = dto.role === RoleCode.AGRICULTEUR ? AccountStatus.ACTIVE : AccountStatus.PENDING;
    const user = await this.prisma.$transaction(async transaction => {
      const role = await transaction.role.findUniqueOrThrow({ where: { code: dto.role } });
      const created = await transaction.user.create({ data: { phone, email: dto.email, passwordHash, status, roles: { create: { roleId: role.id } } } });
      if (dto.role === RoleCode.AGRICULTEUR) {
        await transaction.farmerProfile.create({ data: { userId: created.id, firstName: dto.firstName || 'Utilisateur', lastName: dto.lastName || 'AGRIMAC', city: dto.city, region: dto.region, activity: dto.activity } });
      } else if (dto.role === RoleCode.ENTREPRISE) {
        await transaction.companyProfile.create({ data: { userId: created.id, legalName: dto.displayName || `${dto.firstName || ''} ${dto.lastName || ''}`.trim() || 'Entreprise AGRIMAC', city: dto.city, region: dto.region } });
      } else {
        await transaction.technicianProfile.create({ data: { userId: created.id, displayName: dto.displayName || `${dto.firstName || ''} ${dto.lastName || ''}`.trim() || 'Maintenancier AGRIMAC', skills: dto.skills, city: dto.city, region: dto.region } });
      }
      await transaction.verification.create({ data: { userId: created.id, type: 'PHONE', status: 'PENDING' } });
      return created;
    });
    const otp = await this.createOtp(user.id, OtpPurpose.PHONE_VERIFICATION);
    return { user: await this.getSafeUser(user.id), verificationRequired: true, otp: this.devOtpResponse(otp) };
  }

  async login(dto: LoginDto) {
    const phone = normalizeBeninPhone(dto.phone);
    const user = await this.prisma.user.findUnique({ where: { phone }, include: userInclude });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Numéro ou mot de passe incorrect.');
    const selectedRole = dto.role || user.roles[0]?.role.code;
    if (!selectedRole || !user.roles.some(item => item.role.code === selectedRole)) throw new UnauthorizedException('Ce profil n’est pas associé à ce compte.');
    if (user.status !== AccountStatus.ACTIVE && user.status !== AccountStatus.APPROVED) throw new ForbiddenException('Ce compte n’est pas encore activé par AGRIMAC.');
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return this.issueTokens(user, selectedRole);
  }

  async refresh(dto: RefreshDto) {
    let payload: RefreshTokenPayload;
    try { payload = await this.jwt.verifyAsync<RefreshTokenPayload>(dto.refreshToken, { secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET') }); } catch { throw new UnauthorizedException('Session de rafraîchissement invalide.'); }
    if (payload.type !== 'refresh') throw new UnauthorizedException('Session de rafraîchissement invalide.');
    const session = await this.prisma.refreshSession.findUnique({ where: { id: payload.sessionId }, include: { user: { include: userInclude } } });
    if (!session || session.revokedAt || session.expiresAt <= new Date() || session.tokenHash !== this.hashToken(dto.refreshToken)) throw new UnauthorizedException('Session expirée.');
    await this.prisma.refreshSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
    return this.issueTokens(session.user, session.user.roles[0]?.role.code || RoleCode.AGRICULTEUR);
  }

  async logout(dto: RefreshDto) {
    try {
      const payload = await this.jwt.verifyAsync<RefreshTokenPayload>(dto.refreshToken, { secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET') });
      await this.prisma.refreshSession.updateMany({ where: { id: payload.sessionId, tokenHash: this.hashToken(dto.refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
    } catch { /* Logout is idempotent. */ }
    return { success: true };
  }

  async requestOtp(dto: RequestOtpDto) {
    const phone = normalizeBeninPhone(dto.phone);
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new NotFoundException('Aucun compte ne correspond à ce numéro.');
    const latest = await this.prisma.otpCode.findFirst({ where: { userId: user.id, purpose: dto.purpose || OtpPurpose.PHONE_VERIFICATION }, orderBy: { createdAt: 'desc' } });
    const cooldownSeconds = Number(this.config.get('OTP_RESEND_COOLDOWN_SECONDS', '60'));
    if (latest && latest.createdAt.getTime() + cooldownSeconds * 1000 > Date.now()) { const retryAfter = Math.ceil((latest.createdAt.getTime() + cooldownSeconds * 1000 - Date.now()) / 1000); throw new HttpException({ message: 'Veuillez patienter avant de renvoyer le code.', retryAfter }, HttpStatus.TOO_MANY_REQUESTS); }
    const otp = await this.createOtp(user.id, dto.purpose || OtpPurpose.PHONE_VERIFICATION);
    return { sent: true, expiresAt: otp.expiresAt, cooldownSeconds, delivery: 'provider_not_configured', otp: this.devOtpResponse(otp) };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const phone = normalizeBeninPhone(dto.phone);
    const user = await this.prisma.user.findUnique({ where: { phone }, include: userInclude });
    if (!user) throw new NotFoundException('Aucun compte ne correspond à ce numéro.');
    const purpose = dto.purpose || OtpPurpose.PHONE_VERIFICATION;
    const otp = await this.prisma.otpCode.findFirst({ where: { userId: user.id, purpose, consumedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } });
    if (!otp || otp.attempts >= 5 || !(await bcrypt.compare(dto.code, otp.codeHash))) {
      if (otp) await this.prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      throw new UnauthorizedException('Code de vérification invalide ou expiré.');
    }
    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
    if (purpose === OtpPurpose.PHONE_VERIFICATION) {
      const nextStatus = user.roles.some(item => item.role.code === RoleCode.AGRICULTEUR) ? AccountStatus.ACTIVE : user.status;
      await this.prisma.$transaction([
        this.prisma.user.update({ where: { id: user.id }, data: { phoneVerifiedAt: new Date(), status: nextStatus } }),
        this.prisma.verification.updateMany({ where: { userId: user.id, type: 'PHONE', status: 'PENDING' }, data: { status: 'VERIFIED', reviewedAt: new Date() } }),
      ]);
    }
    const safeUser = await this.getSafeUser(user.id);
    if (purpose === OtpPurpose.PHONE_VERIFICATION) { const refreshed = await this.prisma.user.findUniqueOrThrow({ where: { id: user.id }, include: userInclude }); return { verified: true, ...await this.issueTokens(refreshed, refreshed.roles[0]?.role.code || RoleCode.AGRICULTEUR), user: safeUser }; }
    return { verified: true, user: safeUser };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const phone = normalizeBeninPhone(dto.phone);
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new NotFoundException('Aucun compte ne correspond à ce numéro.');
    const otp = await this.prisma.otpCode.findFirst({ where: { userId: user.id, purpose: OtpPurpose.PASSWORD_RESET, consumedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } });
    if (!otp || otp.attempts >= 5 || !(await bcrypt.compare(dto.code, otp.codeHash))) { if (otp) await this.prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } }); throw new UnauthorizedException('Code de réinitialisation invalide ou expiré.'); }
    await this.prisma.$transaction([this.prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(dto.newPassword, 12) } }), this.prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } }), this.prisma.refreshSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } })]);
    return { reset: true };
  }

  async getSafeUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: userInclude });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return this.serializeUser(user);
  }

  private async issueTokens(user: UserWithProfile, role: RoleCode) {
    const roles = user.roles.map(item => item.role.code);
    const accessPayload: AccessTokenPayload = { sub: user.id, role, roles, type: 'access' };
    const accessToken = await this.jwt.signAsync(accessPayload, { secret: this.config.getOrThrow<string>('JWT_SECRET'), expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES', '15m') as never });
    const sessionId = randomUUID();
    const refreshToken = await this.jwt.signAsync({ sub: user.id, sessionId, type: 'refresh' } satisfies RefreshTokenPayload, { secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'), expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES', '30d') as never });
    const expiresAt = new Date(Date.now() + this.durationMs(this.config.get<string>('JWT_REFRESH_EXPIRES', '30d')));
    await this.prisma.refreshSession.create({ data: { id: sessionId, userId: user.id, tokenHash: this.hashToken(refreshToken), expiresAt } });
    return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES', '15m'), user: this.serializeUser(user) };
  }

  private async createOtp(userId: string, purpose: OtpPurpose) {
    const code = randomInt(100000, 1000000).toString();
    const otp = await this.prisma.otpCode.create({ data: { userId, purpose, codeHash: await bcrypt.hash(code, 10), expiresAt: new Date(Date.now() + 10 * 60 * 1000) } });
    return { ...otp, code };
  }

  private devOtpResponse(otp: { code: string; expiresAt: Date }) {
    return this.config.get('OTP_DEV_EXPOSE', 'false') === 'true' ? { code: otp.code, expiresAt: otp.expiresAt } : { expiresAt: otp.expiresAt };
  }

  private hashToken(token: string) { return createHash('sha256').update(token).digest('hex'); }
  private durationMs(value: string) { const match = value.match(/^(\d+)([smhd])$/); if (!match) return 30 * 24 * 60 * 60 * 1000; const amount = Number(match[1]); return amount * ({ s: 1000, m: 60000, h: 3600000, d: 86400000 } as Record<string, number>)[match[2]]; }

  private serializeUser(user: UserWithProfile) {
    return { id: user.id, phone: user.phone, email: user.email, status: user.status, phoneVerifiedAt: user.phoneVerifiedAt, roles: user.roles.map(item => item.role.code), profile: user.farmerProfile || user.companyProfile || user.technicianProfile || user.adminProfile || null, createdAt: user.createdAt, updatedAt: user.updatedAt };
  }
}
