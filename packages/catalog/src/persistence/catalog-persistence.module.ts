import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmPersistenceModule } from '@tlc/shared-module/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { CatalogProduct } from './entity/catalog-product.entity';
import { CatalogProductRepository } from './repository/catalog-product.repository';

@Module({
  imports: [
    TypeOrmPersistenceModule.forRoot({
      name: 'catalog',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('catalog.database.host'),
        port: configService.get('catalog.database.port'),
        username: configService.get('catalog.database.username'),
        password: configService.get('catalog.database.password'),
        database: configService.get('catalog.database.database'),
        entities: [CatalogProduct],
        migrations: ['dist/packages/catalog/migrations/*.js'],
        migrationsTableName: 'catalog_migrations',
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
  providers: [CatalogProductRepository],
  exports: [CatalogProductRepository],
})
export class CatalogPersistenceModule {}