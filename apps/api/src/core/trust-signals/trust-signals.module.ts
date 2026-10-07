import { Global, Module } from '@nestjs/common';
import { IdentityStatsService } from './identity-stats.service';
import { PresenceService } from './presence.service';

// Global: presence is fed by the chat gateway and the JWT strategy, and read
// by the users, properties and search features
@Global()
@Module({
  providers: [PresenceService, IdentityStatsService],
  exports: [PresenceService, IdentityStatsService],
})
export class TrustSignalsModule {}
