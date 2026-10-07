import { Module } from '@nestjs/common';
import {
  IdentitiesController,
  ProfilesController,
} from './identities.controller';
import { IdentitiesService } from './identities.service';
import { IdentityContactPhoneService } from './identity-contact-phone.service';

@Module({
  controllers: [IdentitiesController, ProfilesController],
  providers: [IdentitiesService, IdentityContactPhoneService],
  exports: [IdentitiesService, IdentityContactPhoneService],
})
export class IdentitiesModule {}
