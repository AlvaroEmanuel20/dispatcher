import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import argon2 from 'argon2';

@Injectable()
export class AdminUserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return await this.prisma.adminUser.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return await this.prisma.adminUser.findUnique({
      where: { email },
    });
  }

  async isValidPassword(password: string, passwordHash: string) {
    const isValid = await argon2.verify(passwordHash, password);
    return isValid;
  }
}
