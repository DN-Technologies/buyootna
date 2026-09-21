import { Global, Module } from '@nestjs/common';
import { PhoneRegistrationPendingService } from './phone-registration-pending.service';

@Global()
@Module({
  providers: [PhoneRegistrationPendingService],
  exports: [PhoneRegistrationPendingService],
})
export class PhoneRegistrationModule {}
