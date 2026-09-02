import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AdminAuthSignInDto } from './admin-auth.dto';
import { AdminAuthService } from './admin-auth.service';
import { seconds, Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @Post()
  @HttpCode(200)
  async signIn(@Body() { email, password }: AdminAuthSignInDto) {
    return await this.adminAuthService.signIn(email, password);
  }
}
