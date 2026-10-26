import { ObservabilityModule } from './core/observability/observability.module';
import { OtpFeedModule } from './core/otp-feed/otp-feed.module';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/prisma/prisma.module';
import { TrustSignalsModule } from './core/trust-signals/trust-signals.module';
import { UsersModule } from './features/users/users.module';
import { AuthModule } from './features/auth/auth.module';
import { RecoveryModule } from './features/recovery/recovery.module';
import { StorageModule } from './core/storage/storage.module';
import { TwilioModule } from './core/twilio/twilio.module';
import { MailModule } from './core/mail/mail.module';
import { GeoIpModule } from './core/geoip/geoip.module';
import { EmailOtpModule } from './core/email-otp/email-otp.module';
import { PhoneRegistrationModule } from './core/phone-registration/phone-registration.module';
import { OtpRateLimiterModule } from './core/otp-rate-limiter/otp-rate-limiter.module';
import { PropertiesModule } from './features/properties/properties.module';
import { SearchModule } from './features/search/search.module';
import { MediaModule } from './media/media.module';
import { StoriesModule } from './features/stories/stories.module';
import { BlocksModule } from './features/blocks/blocks.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { FavoritesModule } from './features/favorites/favorites.module';
import { ChatModule } from './features/chat/chat.module';
import { MapModule } from './features/map/map.module';
import { FaqModule } from './features/faq/faq.module';
import { SettingsModule } from './features/settings/settings.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { SavedLocationsModule } from './features/saved-locations/saved-locations.module';
import { DevicesModule } from './features/devices/devices.module';
import { PlansModule } from './features/plans/plans.module';
import { CompanySubscriptionsModule } from './features/company-subscriptions/company-subscriptions.module';
import { InvoicesModule } from './features/invoices/invoices.module';
import { PaymentsModule } from './features/payments/payments.module';
import { ReviewsModule } from './features/reviews/reviews.module';
import { AdminModule } from './features/admin/admin.module';
import { IdentitiesModule } from './features/identities/identities.module';
import { ReportsModule } from './features/reports/reports.module';
import { CompaniesModule } from './features/company/companies/companies.module';
import { CompanyRequestsModule } from './features/company/company-requests/company-requests.module';
import { CompanyModule } from './features/company/company.module';
import { OfficeModule } from './features/office/office.module';
import { AlertsModule } from './features/alerts/alerts.module';
import { DocsPortalModule } from './features/docs-portal/docs-portal.module';
import { TestingPortalModule } from './features/testing-portal/testing-portal.module';
import { PulseModule } from './features/pulse/pulse.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: 'ar',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    PrismaModule,
    ObservabilityModule,
    OtpFeedModule,
    TrustSignalsModule,
    TwilioModule,
    MailModule,
    GeoIpModule,
    EmailOtpModule,
    PhoneRegistrationModule,
    OtpRateLimiterModule,
    // CompanyModule/OfficeModule declare more specific `/users/*` routes
    // (companies, offices, etc.) than UsersModule's catch-all `GET /:id` --
    // they must be registered before UsersModule so Nest's router matches
    // the specific routes first instead of the catch-all shadowing them.
    CompanyModule,
    OfficeModule,
    UsersModule,
    AuthModule,
    RecoveryModule,
    PropertiesModule,
    SearchModule,
    StorageModule,
    MediaModule,
    FavoritesModule,
    ChatModule,
    MapModule,
    FaqModule,
    SettingsModule,
    NotificationsModule,
    SavedLocationsModule,
    StoriesModule,
    BlocksModule,
    DevicesModule,
    PlansModule,
    CompanySubscriptionsModule,
    InvoicesModule,
    PaymentsModule,
    ReviewsModule,
    AdminModule,
    IdentitiesModule,
    CompaniesModule,
    ReportsModule,
    CompanyRequestsModule,
    AlertsModule,
    DocsPortalModule,
    TestingPortalModule,
    PulseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
