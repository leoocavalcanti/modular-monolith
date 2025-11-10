import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmPersistenceModule } from '@tlc/shared-module/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { OrderPurchaseOrder } from './entity/order-purchase-order.entity';
import { OrderPurchaseOrderItem } from './entity/order-purchase-order-item.entity';
import { OrderPurchaseOrderRepository } from './repository/order-purchase-order.repository';

@Module({
  imports: [
    TypeOrmPersistenceModule.forRoot({
      name: 'order',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('order.database.host'),
        port: configService.get('order.database.port'),
        username: configService.get('order.database.username'),
        password: configService.get('order.database.password'),
        database: configService.get('order.database.database'),
        entities: [OrderPurchaseOrder, OrderPurchaseOrderItem],
        migrations: ['dist/packages/order/migrations/*.js'],
        migrationsTableName: 'order_migrations',
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
  providers: [OrderPurchaseOrderRepository],
  exports: [OrderPurchaseOrderRepository],
})
export class OrderPersistenceModule {}