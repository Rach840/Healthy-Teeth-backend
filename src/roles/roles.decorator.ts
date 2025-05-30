import { SetMetadata } from '@nestjs/common';
import { Roles as Role } from '../../prisma/generated/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
