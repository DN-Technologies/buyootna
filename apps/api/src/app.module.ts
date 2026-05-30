import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/prisma/prisma.module';
import { UsersModule } from './features/users/users.module';
import { AuthModule } from './features/auth/auth.module';
import { RecoveryModule } from './features/recovery/recovery.module';
import { StorageModule } from './core/storage/storage.module';
import { PropertiesModule } from './features/properties/properties.module';
import { SearchService } from './features/search/search.service';
import { SearchController } from './features/search/search.controller';
import { SearchModule } from './features/search/search.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    RecoveryModule,
    StorageModule,
    PropertiesModule,
    SearchModule,
  ],
  controllers: [AppController, SearchController],
  providers: [AppService, SearchService],
})
export class AppModule {}
