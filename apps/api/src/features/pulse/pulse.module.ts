import { Module } from '@nestjs/common';
import { AlertsModule } from '../alerts/alerts.module';
import { CompanyRequestsModule } from '../company/company-requests/company-requests.module';
import { PulseController } from './pulse.controller';
import { PulseService } from './pulse.service';

@Module({
  imports: [AlertsModule, CompanyRequestsModule],
  controllers: [PulseController],
  providers: [PulseService],
})
export class PulseModule {}
