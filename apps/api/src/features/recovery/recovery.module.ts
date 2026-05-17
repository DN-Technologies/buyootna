import { Module } from '@nestjs/common';
import { RecoveryController } from './recovery.controller';
import { RecoveryService } from './recovery.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-fallback-key',
      signOptions: { expiresIn: '15m' }, // Reset tokens expire FAST (15 mins)
    }),
  ],
  controllers: [RecoveryController],
  providers: [RecoveryService],
})
export class RecoveryModule {}
