import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateApplicationDto, UpdateApplicationDto } from './applications.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getApplications() {
    return await this.prisma.application.findMany();
  }

  async getApplicationById(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async createApplication(data: CreateApplicationDto) {
    return await this.prisma.application.create({
      data,
    });
  }

  async updateApplication(id: string, data: UpdateApplicationDto) {
    return await this.prisma.application.update({
      where: { id },
      data,
    });
  }
}
