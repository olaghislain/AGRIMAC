import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RoleCode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

const userInclude = {
  roles: { include: { role: true } },
  farmerProfile: true,
  companyProfile: true,
  technicianProfile: true,
  adminProfile: true,
} satisfies Prisma.UserInclude;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: userInclude });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return this.serialize(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { roles: { include: { role: true } } } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    const role = user.roles[0]?.role.code;
    if (role === RoleCode.AGRICULTEUR) await this.prisma.farmerProfile.update({ where: { userId }, data: { firstName: dto.firstName, lastName: dto.lastName, city: dto.city, region: dto.region, activity: dto.activity } });
    else if (role === RoleCode.ENTREPRISE) await this.prisma.companyProfile.update({ where: { userId }, data: { legalName: dto.displayName, city: dto.city, region: dto.region } });
    else if (role === RoleCode.MAINTENANCIER) await this.prisma.technicianProfile.update({ where: { userId }, data: { displayName: dto.displayName, city: dto.city, region: dto.region, skills: dto.skills } });
    else if (role === RoleCode.ADMINISTRATEUR) await this.prisma.adminProfile.update({ where: { userId }, data: { displayName: dto.displayName } });
    return this.me(userId);
  }

  getPreferences(userId: string) { return this.prisma.userPreference.upsert({ where: { userId }, update: {}, create: { userId } }); }
  updatePreferences(userId: string, dto: UpdatePreferencesDto) { return this.prisma.userPreference.upsert({ where: { userId }, update: dto, create: { userId, ...dto } }); }

  private serialize(user: Prisma.UserGetPayload<{ include: typeof userInclude }>) {
    return { id: user.id, phone: user.phone, email: user.email, status: user.status, phoneVerifiedAt: user.phoneVerifiedAt, roles: user.roles.map(item => item.role.code), profile: user.farmerProfile || user.companyProfile || user.technicianProfile || user.adminProfile || null, createdAt: user.createdAt, updatedAt: user.updatedAt };
  }
}
