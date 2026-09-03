import { SetMetadata } from '@nestjs/common';
import { AdminRole } from 'generated/prisma/enums';

export const ROLES_KEY = 'roles';
export const AdminRoles = (...roles: AdminRole[]) =>
  SetMetadata(ROLES_KEY, roles);
