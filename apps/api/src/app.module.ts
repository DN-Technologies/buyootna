import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/prisma/prisma.module';
import { UsersModule } from './features/users/users.module';
import { AuthModule } from './features/auth/auth.module';
import { RecoveryModule } from './features/recovery/recovery.module';
import { StorageModule } from './core/storage/storage.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    RecoveryModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
