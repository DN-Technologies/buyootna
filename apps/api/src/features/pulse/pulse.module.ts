import { Module } from '@nestjs/common';
import { AlertsModule } from '../alerts/alerts.module';
import { PulseController } from './pulse.controller';
import { PulseService } from './pulse.service';

@Module({
  imports: [AlertsModule],
  controllers: [PulseController],
  providers: [PulseService],
})
export class PulseModule {}
