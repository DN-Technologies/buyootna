import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppVersionTracker } from './app-version-tracker.service';
import { ObservabilityMiddleware } from './observability.middleware';

/** Request ids, request metrics and app-build tracking for every route. */
@Global()
@Module({
  providers: [AppVersionTracker],
  exports: [AppVersionTracker],
})
export class ObservabilityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ObservabilityMiddleware).forRoutes('*');
  }
}
