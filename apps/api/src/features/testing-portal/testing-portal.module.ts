import { Module } from '@nestjs/common';
import { DocsLoginLimiterService } from '../docs-portal/docs-login-limiter.service';
import { TestingAuditService } from './testing-audit.service';
import { TestingAuthGuard } from './testing-auth.guard';
import { TestingHealthService } from './testing-health.service';
import { TestingMetricsService } from './testing-metrics.service';
import { TestingPortalController } from './testing-portal.controller';
import { TestingPortalService } from './testing-portal.service';
import { TestingTokenService } from './testing-token.service';

/**
 * testing.buyootna.cloud: the testers' and QA team's portal — health,
 * metrics, logs and builds, behind its own password.
 */
@Module({
  controllers: [TestingPortalController],
  providers: [
    TestingPortalService,
    TestingTokenService,
    TestingAuthGuard,
    TestingAuditService,
    TestingHealthService,
    TestingMetricsService,
    // Its own instance: wrong testing passwords don't lock the docs portal
    DocsLoginLimiterService,
  ],
  exports: [TestingAuditService, TestingAuthGuard, TestingTokenService],
})
export class TestingPortalModule {}
