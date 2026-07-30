import { Module } from '@nestjs/common';
import { IdentitiesController, ProfilesController } from './identities.controller';
import { IdentitiesService } from './identities.service';

@Module({
  controllers: [IdentitiesController, ProfilesController],
  providers: [IdentitiesService],
  exports: [IdentitiesService],
})
export class IdentitiesModule {}
