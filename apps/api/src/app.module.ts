import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/prisma/prisma.module';
import { UsersModule } from './features/users/users.module';
import { AuthModule } from './features/auth/auth.module';
import { RecoveryModule } from './features/recovery/recovery.module';
import { StorageModule } from './core/storage/storage.module';
import { TwilioModule } from './core/twilio/twilio.module';
import { MailModule } from './core/mail/mail.module';
import { EmailOtpModule } from './core/email-otp/email-otp.module';
import { OtpRateLimiterModule } from './core/otp-rate-limiter/otp-rate-limiter.module';
import { PropertiesModule } from './features/properties/properties.module';
import { SearchModule } from './features/search/search.module';
import { MediaModule } from './media/media.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { FavoritesModule } from './features/favorites/favorites.module';
import { ChatModule } from './features/chat/chat.module';
import { MapModule } from './features/map/map.module';
import { FaqModule } from './features/faq/faq.module';
import { SettingsModule } from './features/settings/settings.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { DevicesModule } from './features/devices/devices.module';
import { PlansModule } from './features/plans/plans.module';
import { InvoicesModule } from './features/invoices/invoices.module';
import { PaymentsModule } from './features/payments/payments.module';
import { ReviewsModule } from './features/reviews/reviews.module';
import { AdminModule } from './features/admin/admin.module';
import { IdentitiesModule } from './features/identities/identities.module';
import { CompaniesModule } from './features/companies/companies.module';
import { ReportsModule } from './features/reports/reports.module';

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
    TwilioModule,
    MailModule,
    EmailOtpModule,
    OtpRateLimiterModule,
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
    DevicesModule,
    PlansModule,
    InvoicesModule,
    PaymentsModule,
    ReviewsModule,
    AdminModule,
    IdentitiesModule,
    CompaniesModule,
    ReportsModule,
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
