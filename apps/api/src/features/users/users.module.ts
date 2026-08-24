import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersRegistrationService } from './services/users-registration.service';
import { UsersProfileService } from './services/users-profile.service';
import { UsersDirectoryService } from './services/users-directory.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersRegistrationService,
    UsersProfileService,
    UsersDirectoryService,
  ],
  exports: [UsersRegistrationService],
})
export class UsersModule {}
