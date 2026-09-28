import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersRegistrationService } from './services/users-registration.service';
import { UsersProfileService } from './services/users-profile.service';
import { UsersDirectoryService } from './services/users-directory.service';
import { AccountSuspensionService } from './services/account-suspension.service';
import { CompanyController } from '../company/company.controller';
import { OfficeController } from '../office/office.controller';

@Module({
  // CompanyController / OfficeController declare literal `/users/*` routes
  // (companies, offices, register/company, ...) that must be registered
  // before UsersController's catch-all `GET /:id`, or that route shadows
  // them. Nest only guarantees route order within a single module's own
  // `controllers` array (cross-module order depends on the dependency
  // graph, not import position, and isn't safe to rely on) -- so these stay
  // declared here even though their code lives in features/company and
  // features/office.
  controllers: [CompanyController, OfficeController, UsersController],
  providers: [
    UsersRegistrationService,
    UsersProfileService,
    UsersDirectoryService,
    AccountSuspensionService,
  ],
  exports: [
    UsersRegistrationService,
    UsersProfileService,
    UsersDirectoryService,
  ],
})
export class UsersModule {}
