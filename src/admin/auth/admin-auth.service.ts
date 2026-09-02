import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminUserService } from 'src/admin/user/admin-user.service';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly adminService: AdminUserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAdmin(email: string, password: string) {
    const admin = await this.adminService.findByEmail(email);

    if (!admin || !admin.isActive) {
      return null;
    }

    const isValidPassword = await this.adminService.isValidPassword(
      password,
      admin.password,
    );

    if (!isValidPassword) {
      return null;
    }

    return admin;
  }

  async signIn(email: string, password: string) {
    const admin = await this.validateAdmin(email, password);

    if (!admin) {
      throw new UnauthorizedException();
    }

    return {
      accessToken: await this.jwtService.signAsync({
        sub: admin.id,
        role: admin.role,
        isActive: admin.isActive,
      }),
    };
  }
}
