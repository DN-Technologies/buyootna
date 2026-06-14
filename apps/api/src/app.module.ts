import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/prisma/prisma.module';
import { UsersModule } from './features/users/users.module';
import { AuthModule } from './features/auth/auth.module';
import { RecoveryModule } from './features/recovery/recovery.module';
import { StorageModule } from './core/storage/storage.module';
import { PropertiesModule } from './features/properties/properties.module';
import { SearchModule } from './features/search/search.module';
import { MediaModule } from './media/media.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';

@Module({
  imports: [
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
    UsersModule,
    AuthModule,
    RecoveryModule,
    PropertiesModule,
    SearchModule,
    StorageModule,
    MediaModule,
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
