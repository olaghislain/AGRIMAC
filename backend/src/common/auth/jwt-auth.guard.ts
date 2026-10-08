import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload } from './auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: unknown }>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('Authentification requise.');
    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, { secret: this.config.getOrThrow<string>('JWT_SECRET') });
      if (payload.type !== 'access' || !payload.sub || !payload.role) throw new UnauthorizedException('Jeton invalide.');
      request.user = { userId: payload.sub, role: payload.role, roles: payload.roles ?? [payload.role] };
      return true;
    } catch {
      throw new UnauthorizedException('Jeton d’accès invalide ou expiré.');
    }
  }
}
