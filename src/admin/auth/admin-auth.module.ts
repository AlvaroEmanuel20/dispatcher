import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminUserModule } from 'src/admin/user/admin-user.module';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import type { StringValue } from 'ms';

@Module({
  imports: [
    DatabaseModule,
    AdminUserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: configService.getOrThrow<StringValue>('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AdminAuthModule {}
