import { Module } from '@nestjs/common';

import { AuthModule } from '@tlc/shared-module/auth';
import {
  BillingSubscriptionHttpClient,
  BillingSubscriptionStatusApi,
  PublicApiModule,
} from '@tlc/shared-module/public-api';
import { AuthService } from './core/service/authentication.service';
import { UserManagementService } from './core/service/user-management.service';
import { IdentityPersistenceModule } from './persistence/identity-persistence.module';
import { UserRepository } from './persistence/repository/user.repository';
import { AuthController } from './http/rest/controller/auth.controller';

@Module({
  imports: [
    IdentityPersistenceModule,
    PublicApiModule,
    AuthModule,
  ],
  controllers: [
    AuthController,
  ],
  providers: [
    {
      provide: BillingSubscriptionStatusApi,
      useExisting: BillingSubscriptionHttpClient,
    },
    AuthService,
    UserManagementService,
    UserRepository,
  ],
  exports: [
    AuthService,
    UserManagementService,
  ],
})
export class IdentityModule {}
