import { Module } from '@nestjs/common';
import { PlanSlotsExpiryService } from './plan-slots-expiry.service';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';

@Module({
  controllers: [PlansController],
  providers: [PlansService, PlanSlotsExpiryService],
  exports: [PlansService],
})
export class PlansModule {}
