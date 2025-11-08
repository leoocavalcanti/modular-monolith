import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmPersistenceModule } from '@tlc/shared-module/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { CartShoppingCart } from './entity/cart-shopping-cart.entity';
import { CartShoppingCartItem } from './entity/cart-shopping-cart-item.entity';
import { CartShoppingCartRepository } from './repository/cart-shopping-cart.repository';
import { CartShoppingCartItemRepository } from './repository/cart-shopping-cart-item.repository';

@Module({
  imports: [
    TypeOrmPersistenceModule.forRoot({
      name: 'cart',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('cart.database.host'),
        port: configService.get('cart.database.port'),
        username: configService.get('cart.database.username'),
        password: configService.get('cart.database.password'),
        database: configService.get('cart.database.database'),
        entities: [CartShoppingCart, CartShoppingCartItem],
        migrations: ['dist/packages/cart/migrations/*.js'],
        migrationsTableName: 'cart_migrations',
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
  providers: [CartShoppingCartRepository, CartShoppingCartItemRepository],
  exports: [CartShoppingCartRepository, CartShoppingCartItemRepository],
})
export class CartPersistenceModule {}