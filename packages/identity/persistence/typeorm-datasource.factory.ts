import { ConfigService } from '@tlc/shared-module/config';
import { join } from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { IdentityConfig } from '../config';
import { User } from './entity/user.entity';

export const dataSourceOptionsFactory = (
  configService: ConfigService<IdentityConfig>
): PostgresConnectionOptions => ({
  type: 'postgres',
  name: 'identity',
  host: configService.get('identity.database.host'),
  port: configService.get('identity.database.port'),
  username: configService.get('identity.database.username'),
  password: configService.get('identity.database.password'),
  database: configService.get('identity.database.database'),
  synchronize: false,
  entities: [User],
  migrations: [join(__dirname, 'migration', '*-migration.{ts,js}')],
  migrationsRun: false,
  migrationsTableName: 'identity_migrations',
  logging: false,
});
