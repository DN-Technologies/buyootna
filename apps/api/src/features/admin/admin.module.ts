import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ADMIN_CONTROLLERS } from './controllers';
import { AdminService } from './admin.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminUsersService } from './services/users/admin-users.service';
import { AdminIdentityService } from './services/users/admin-identity.service';
import { AdminExportService } from './services/dashboard/admin-export.service';
import { AdminPasswordService } from './services/users/admin-password.service';
import { AdminCouponService } from './services/billing/admin-coupon.service';
import { AdminDashboardService } from './services/dashboard/admin-dashboard.service';
import { AdminVerificationsService } from './services/users/admin-verifications.service';
import { AdminReportsService } from './services/moderation/admin-reports.service';
import { AdminAuditLogService } from './services/audit/admin-audit-log.service';
import { AdminPropertiesService } from './services/moderation/admin-properties.service';
import { AdminRequestsService } from './services/user-profile/admin-requests.service';
import { AdminExhibitionService } from './services/user-profile/admin-exhibition.service';
import { AdminPlansService } from './services/billing/admin-plans.service';
import { AdminPlanCatalogService } from './services/billing/admin-plan-catalog.service';
import { AdminFeaturePackagesService } from './services/billing/admin-feature-packages.service';
import { AdminInvoicesService } from './services/billing/admin-invoices.service';
import { AdminBillingListService } from './services/billing/admin-billing-list.service';
import { AdminRatingsService } from './services/user-profile/admin-ratings.service';
import { AdminNotesService } from './services/users/admin-notes.service';
import { CompanyRequestsModule } from '../company/company-requests/company-requests.module';
import { PlansModule } from '../plans/plans.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [
    NotificationsModule,
    CompanyRequestsModule,
    PlansModule,
    InvoicesModule,
    ReviewsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-fallback-key',
    }),
  ],
  controllers: ADMIN_CONTROLLERS,
  providers: [
    AdminService,
    AdminUsersService,
    AdminIdentityService,
    AdminExportService,
    AdminPasswordService,
    AdminCouponService,
    AdminDashboardService,
    AdminVerificationsService,
    AdminReportsService,
    AdminAuditLogService,
    AdminPropertiesService,
    AdminRequestsService,
    AdminExhibitionService,
    AdminPlansService,
    AdminPlanCatalogService,
    AdminInvoicesService,
    AdminBillingListService,
    AdminRatingsService,
    AdminNotesService,
    AdminFeaturePackagesService,
  ],
  exports: [
    AdminService,
    AdminUsersService,
    AdminIdentityService,
    AdminExportService,
    AdminPasswordService,
    AdminCouponService,
    AdminDashboardService,
    AdminVerificationsService,
    AdminReportsService,
    AdminAuditLogService,
    AdminPropertiesService,
    AdminRequestsService,
    AdminExhibitionService,
    AdminPlansService,
    AdminInvoicesService,
    AdminRatingsService,
    AdminNotesService,
    AdminFeaturePackagesService,
  ],
})
export class AdminModule {}
