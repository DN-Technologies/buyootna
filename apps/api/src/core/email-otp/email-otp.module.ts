import { Global, Module } from '@nestjs/common';
import { EmailOtpService } from './email-otp.service';

@Global()
@Module({
  providers: [EmailOtpService],
  exports: [EmailOtpService],
})
export class EmailOtpModule {}
