import { SetMetadata } from '@nestjs/common';
import { RoleCode } from '@prisma/client';

export const ROLES_KEY = 'agrimac_roles';
export const Roles = (...roles: RoleCode[]) => SetMetadata(ROLES_KEY, roles);
