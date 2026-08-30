import { Global, Module } from '@nestjs/common';
import { OtpRateLimiterService } from './otp-rate-limiter.service';

@Global()
@Module({
  providers: [OtpRateLimiterService],
  exports: [OtpRateLimiterService],
})
export class OtpRateLimiterModule {}
