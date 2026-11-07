import { Module } from '@nestjs/common';
import {
  IdentitiesController,
  ProfilesController,
} from './identities.controller';
import { IdentitiesService } from './identities.service';
import { IdentityContactPhoneService } from './identity-contact-phone.service';
import { CompanyVerificationController } from './verification/company-verification.controller';
import { CompanyVerificationService } from './verification/company-verification.service';

@Module({
  controllers: [
    IdentitiesController,
    ProfilesController,
    CompanyVerificationController,
  ],
  providers: [
    IdentitiesService,
    IdentityContactPhoneService,
    CompanyVerificationService,
  ],
  exports: [
    IdentitiesService,
    IdentityContactPhoneService,
    CompanyVerificationService,
  ],
})
export class IdentitiesModule {}
