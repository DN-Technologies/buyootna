import { Module } from '@nestjs/common';
import { DocsPortalController } from './docs-portal.controller';
import { DocsPortalService } from './docs-portal.service';
import { DocsTokenService } from './docs-token.service';
import { DocsLoginLimiterService } from './docs-login-limiter.service';
import { DocsAuthGuard } from './docs-auth.guard';

/** Access to docs.buyootna.cloud: role passwords and docs tokens. */
@Module({
  controllers: [DocsPortalController],
  providers: [
    DocsPortalService,
    DocsTokenService,
    DocsLoginLimiterService,
    DocsAuthGuard,
  ],
  exports: [DocsTokenService, DocsAuthGuard],
})
export class DocsPortalModule {}
