import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { StorageModule } from 'src/core/storage/storage.module';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PropertiesActivityService } from './services/properties-activity.service';
import { PropertiesExpiryService } from './services/properties-expiry.service';
import { PropertiesFeedService } from './services/properties-feed.service';
import { PropertiesMutationsService } from './services/properties-mutations.service';
import { PropertiesQuotaService } from './services/properties-quota.service';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [PropertiesController],
  providers: [
    PropertiesQuotaService,
    PropertiesFeedService,
    PropertiesActivityService,
    PropertiesMutationsService,
    PropertiesExpiryService,
    PropertiesService,
  ],
  exports: [
    PropertiesService,
    PropertiesFeedService,
    PropertiesMutationsService,
    PropertiesActivityService,
    PropertiesQuotaService,
  ],
})
export class PropertiesModule {}
