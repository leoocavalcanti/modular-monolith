import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmPersistenceModule } from '@tlc/shared-module/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { PaymentTransaction } from './entity/payment-transaction.entity';
import { PaymentTransactionRepository } from './repository/payment-transaction.repository';

@Module({
  imports: [
    TypeOrmPersistenceModule.forRoot({
      name: 'payment',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('payment.database.host'),
        port: configService.get('payment.database.port'),
        username: configService.get('payment.database.username'),
        password: configService.get('payment.database.password'),
        database: configService.get('payment.database.database'),
        entities: [PaymentTransaction],
        migrations: ['dist/packages/payment/migrations/*.js'],
        migrationsTableName: 'payment_migrations',
        synchronize: process.env.NODE_ENV === 'development',
      }),
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }
        return addTransactionalDataSource({
          name: options.name,
          dataSource: new DataSource(options),
        });
      },
    }),
  ],
  providers: [PaymentTransactionRepository],
  exports: [PaymentTransactionRepository],
})
export class PaymentPersistenceModule {}