import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtAdminPayload } from 'src/admin/auth/admin-auth.types';
import { AdminUserService } from 'src/admin/user/admin-user.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminUserService: AdminUserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (!token || type !== 'Bearer') {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtAdminPayload>(token);
      const admin = await this.adminUserService.findById(payload.sub);

      if (!admin || !admin.isActive) {
        throw new UnauthorizedException();
      }

      request['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
