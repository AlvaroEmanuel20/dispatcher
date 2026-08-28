import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModuleOptions } from '@bull-board/nestjs';
import { ConfigService } from '@nestjs/config';
import expressBasicAuth from 'express-basic-auth';

export function getBullBoardConfig(
  configService: ConfigService,
): BullBoardModuleOptions {
  const user = configService.getOrThrow<string>('BULL_BOARD_USER');
  const password = configService.getOrThrow<string>('BULL_BOARD_PASSWORD');

  return {
    route: '/queues',
    adapter: ExpressAdapter,
    middleware: expressBasicAuth({
      challenge: true,
      users: { [user]: password },
    }),
  };
}
