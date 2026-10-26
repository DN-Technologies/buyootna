import { Global, Module } from '@nestjs/common';
import { OtpFeedService } from './otp-feed.service';

/** The OTPs the platform sends, for the testing portal (in memory). */
@Global()
@Module({
  providers: [OtpFeedService],
  exports: [OtpFeedService],
})
export class OtpFeedModule {}
