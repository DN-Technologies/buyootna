import { Module } from '@nestjs/common';
import { RecoveryController } from './recovery.controller';
import { RecoveryService } from './recovery.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtSecret } from 'src/core/utils/jwt-secret';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtSecret(),
      signOptions: { expiresIn: '15m' }, // Reset tokens expire FAST (15 mins)
    }),
  ],
  controllers: [RecoveryController],
  providers: [RecoveryService],
})
export class RecoveryModule {}
