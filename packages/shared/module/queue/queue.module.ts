import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '../config';
import { ConfigService } from '@nestjs/config';
import { QUEUES } from './queue-constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'redis'),
          port: configService.get('REDIS_PORT', 6379),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 10,
          removeOnFail: 50,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: QUEUES.PAYMENT_PROCESSING,
      },
      {
        name: QUEUES.ORDER_FULFILLMENT,
      },
      {
        name: QUEUES.EMAIL_NOTIFICATION,
      },
      {
        name: QUEUES.INVENTORY_UPDATE,
      },
      {
        name: QUEUES.PAYMENT_CONFIRMATION,
      },
      {
        name: QUEUES.PAYMENT_RETRY,
      }
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}