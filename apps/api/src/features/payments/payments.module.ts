import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { DiscountCodesService } from './services/discount-codes.service';
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
    DiscountCodesService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
