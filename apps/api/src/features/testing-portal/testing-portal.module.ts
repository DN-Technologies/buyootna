import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { IdentitiesModule } from '../identities/identities.module';
import { PlansModule } from '../plans/plans.module';
import { TestingAccountsController } from './testing-accounts.controller';
import { TestingAccountsService } from './testing-accounts.service';
import { TestingBugsController } from './testing-bugs.controller';
import { TestingBugsService } from './testing-bugs.service';
import { TestingDatabaseController } from './testing-database.controller';
import { TestingDatabaseService } from './testing-database.service';
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
 * metrics, logs, builds, OTPs and account tools, behind its own password.
 */
@Module({
  imports: [AdminModule, IdentitiesModule, PlansModule],
  controllers: [
    TestingPortalController,
    TestingAccountsController,
    TestingBugsController,
    TestingDatabaseController,
  ],
  providers: [
    TestingPortalService,
    TestingTokenService,
    TestingAuthGuard,
    TestingAuditService,
    TestingHealthService,
    TestingMetricsService,
    TestingAccountsService,
    TestingBugsService,
    TestingDatabaseService,
    // Its own instance: wrong testing passwords don't lock the docs portal
    DocsLoginLimiterService,
  ],
  exports: [TestingAuditService, TestingAuthGuard, TestingTokenService],
})
export class TestingPortalModule {}
