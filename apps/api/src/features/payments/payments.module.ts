import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { FeatureCheckoutService } from './services/feature-checkout.service';
import { PaymentFulfillmentService } from './services/payment-fulfillment.service';
import { PlanCheckoutService } from './services/plan-checkout.service';
import { SubscriptionCheckoutService } from './services/subscription-checkout.service';
import { TapGatewayService } from './services/tap-gateway.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    TapGatewayService,
    PaymentFulfillmentService,
    PlanCheckoutService,
    FeatureCheckoutService,
    SubscriptionCheckoutService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
