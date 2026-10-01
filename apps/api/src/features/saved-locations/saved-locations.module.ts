import { Module } from '@nestjs/common';
import { SavedLocationsController } from './saved-locations.controller';
import { SavedLocationsService } from './saved-locations.service';

@Module({
  controllers: [SavedLocationsController],
  providers: [SavedLocationsService],
})
export class SavedLocationsModule {}
