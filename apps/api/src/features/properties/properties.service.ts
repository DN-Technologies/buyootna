import { Injectable } from '@nestjs/common';
import { ListingStatus } from '@prisma/client';
import { CreatePropertyDto } from './dto/create-property.dto';
import { GetPropertiesFilterDto } from './dto/get-properties-filter.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertiesActivityService } from './services/properties-activity.service';
import { PropertiesFeedService } from './services/properties-feed.service';
import { PropertiesMutationsService } from './services/properties-mutations.service';
import { PropertiesQuotaService } from './services/properties-quota.service';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly feedService: PropertiesFeedService,
    private readonly mutationsService: PropertiesMutationsService,
    private readonly activityService: PropertiesActivityService,
    private readonly quotaService: PropertiesQuotaService,
  ) {}

  // --- PUBLIC FEED & DISCOVERY ---
  getHomeFeed(viewerUserId?: string) {
    return this.feedService.getHomeFeed(viewerUserId);
  }

  findAll(filters: GetPropertiesFilterDto, viewerUserId?: string) {
    return this.feedService.findAll(filters, viewerUserId);
  }

  findOne(id: string, viewerUserId?: string) {
    return this.feedService.findOne(id, viewerUserId);
  }

  incrementViews(id: string) {
    return this.feedService.incrementViews(id);
  }

  // --- MUTATIONS & LIFECYCLE ---
  create(identityId: string, dto: CreatePropertyDto) {
    return this.mutationsService.create(identityId, dto);
  }

  update(identityId: string, propertyId: string, dto: UpdatePropertyDto) {
    return this.mutationsService.update(identityId, propertyId, dto);
  }

  remove(identityId: string, propertyId: string, reason?: string) {
    return this.mutationsService.remove(identityId, propertyId, reason);
  }

  archive(identityId: string, propertyId: string) {
    return this.mutationsService.archive(identityId, propertyId);
  }

  renew(identityId: string, propertyId: string, planSlotId?: string) {
    return this.mutationsService.renew(identityId, propertyId, planSlotId);
  }

  verifyOwnership(identityId: string, propertyId: string) {
    return this.mutationsService.verifyOwnership(identityId, propertyId);
  }

  // --- ACTIVITY ---
  getMyActivity(identityId: string, statusFilter?: ListingStatus) {
    return this.activityService.getMyActivity(identityId, statusFilter);
  }
}
