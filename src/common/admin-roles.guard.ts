import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '../generated/prisma/enums';
import { ROLES_KEY } from './admin-roles.decorator';
import { AuthenticatedAdminRequest } from '../admin/auth/admin-auth.types';

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<AuthenticatedAdminRequest>();

    return requiredRoles.some((role) => user.role.includes(role));
  }
}
