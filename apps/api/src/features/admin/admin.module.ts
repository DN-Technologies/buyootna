import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminUsersService } from './services/admin-users.service';
import { AdminIdentityService } from './services/admin-identity.service';
import { AdminExportService } from './services/admin-export.service';
import { AdminPasswordService } from './services/admin-password.service';
import { AdminCouponService } from './services/admin-coupon.service';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { AdminVerificationsService } from './services/admin-verifications.service';
import { AdminReportsService } from './services/admin-reports.service';

@Module({
  imports: [
    NotificationsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-fallback-key',
    }),
  ],
  controllers: [AdminController],
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
  ],
})
export class AdminModule {}
