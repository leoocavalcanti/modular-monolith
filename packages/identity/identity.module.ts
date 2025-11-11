import { Module } from '@nestjs/common';

import { AuthModule } from '@tlc/shared-module/auth';
import { AuthService } from './core/service/authentication.service';
import { UserManagementService } from './core/service/user-management.service';
import { IdentityPersistenceModule } from './persistence/identity-persistence.module';
import { UserRepository } from './persistence/repository/user.repository';
import { AuthController } from './http/rest/controller/auth.controller';

@Module({
  imports: [
    IdentityPersistenceModule,
    AuthModule,
  ],
  controllers: [
    AuthController,
  ],
  providers: [
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
