import { BullRootModuleOptions } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

export function getBullQueueConfig(
  configService: ConfigService,
): BullRootModuleOptions {
  return {
    connection: {
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
    },
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: {
        age: 60 * 60 * 24,
        count: 1000,
      },
      removeOnFail: {
        age: 60 * 60 * 24 * 30,
        count: 10000,
      },
    },
  };
}
