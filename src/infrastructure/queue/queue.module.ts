import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import QUEUES from './queues';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUES.EMAIL,
    }),
    BullBoardModule.forFeature({
      name: QUEUES.EMAIL,
      adapter: BullMQAdapter,
    }),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
