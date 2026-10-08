import { RoleCode } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string;
  role: RoleCode;
  roles: RoleCode[];
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: 'refresh';
}

export interface AuthenticatedRequestUser {
  userId: string;
  role: RoleCode;
  roles: RoleCode[];
}
