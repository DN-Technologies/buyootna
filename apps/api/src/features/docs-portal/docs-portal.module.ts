import { Module } from '@nestjs/common';
import { DocsPortalController } from './docs-portal.controller';
import { DocsPortalService } from './docs-portal.service';
import { DocsTokenService } from './docs-token.service';
import { DocsLoginLimiterService } from './docs-login-limiter.service';
import { DocsAuthGuard } from './docs-auth.guard';
import { DocsTrackingController } from './docs-tracking.controller';
import { DocsTrackingService } from './docs-tracking.service';

/** docs.buyootna.cloud: role-password access and test tracking. */
@Module({
  controllers: [DocsPortalController, DocsTrackingController],
  providers: [
    DocsPortalService,
    DocsTokenService,
    DocsLoginLimiterService,
    DocsAuthGuard,
    DocsTrackingService,
  ],
  exports: [DocsTokenService, DocsAuthGuard],
})
export class DocsPortalModule {}
