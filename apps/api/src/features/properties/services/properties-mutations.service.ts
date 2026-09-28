import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ListingStatus } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { AlertMatchingService } from '../../alerts/alert-matching.service';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { PropertiesQuotaService } from './properties-quota.service';
import { generateReferenceNumber } from './property-formatting.util';

const DAY_MS = 24 * 60 * 60 * 1000;

// Statuses the "مؤرشفة" tab shows, and the only ones that can be republished
const ARCHIVED_STATUSES: ListingStatus[] = [
  ListingStatus.EXPIRED,
  ListingStatus.CLOSED,
];

@Injectable()
export class PropertiesMutationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quotaService: PropertiesQuotaService,
    private readonly alertMatching: AlertMatchingService,
  ) {}

  // A listing just went live: notify matching alerts. Runs after the
  // transaction has committed and is not awaited -- it never throws, and a
  // slow or failed match must not hold up or fail the publish.
  private notifyAlertMatches(propertyId: string) {
    void this.alertMatching.notifyMatchesForProperty(propertyId);
  }

  // --- CREATE ---
  async create(identityId: string, dto: CreatePropertyDto) {
    const { isDraft, planSlotId, ...propertyData } = dto;
    const targetStatus = isDraft ? ListingStatus.DRAFT : ListingStatus.ACTIVE;

    if (!isDraft) {
      const created = await this.prisma.$transaction(async (tx) => {
        const imagesCount = propertyData.images?.length || 0;
        const quota = await this.quotaService.resolvePublishQuota(
          identityId,
          planSlotId,
          imagesCount,
          tx,
        );

        const endDate = new Date(
          Date.now() + quota.durationDays * 24 * 60 * 60 * 1000,
        );
        const isFeatured = quota.featuredDays > 0;
        const featuredUntil =
          quota.featuredDays > 0
            ? new Date(Date.now() + quota.featuredDays * 24 * 60 * 60 * 1000)
            : null;
        const isPriority = quota.prioritySearch;

        let referenceNumber = 0;
        let isUnique = false;
        while (!isUnique) {
          referenceNumber = generateReferenceNumber();
          const existing = await tx.property.findUnique({
            where: { referenceNumber },
          });
          if (!existing) isUnique = true;
        }

        const newProperty = await tx.property.create({
          data: {
            ...propertyData,
            referenceNumber,
            status: targetStatus,
            identityId,
            planSlotId: quota.planSlotId,
            endDate,
            isFeatured,
            featuredUntil,
            isPriority,
            publishedAt: new Date(),
          },
        });

        return {
          message: 'تم إضافة الاعلان بنجاح!',
          property: newProperty,
        };
      });
      this.notifyAlertMatches(created.property.id);
      return created;
    } else {
      let referenceNumber = 0;
      let isUnique = false;
      while (!isUnique) {
        referenceNumber = generateReferenceNumber();
        const existing = await this.prisma.property.findUnique({
          where: { referenceNumber },
        });
        if (!existing) isUnique = true;
      }

      const draftProperty = await this.prisma.property.create({
        data: {
          ...propertyData,
          referenceNumber,
          status: targetStatus,
          identityId,
          planSlotId:
            planSlotId && planSlotId !== 'FREE_QUOTA' ? planSlotId : null,
        },
      });

      return {
        message: 'تم حفظ الاعلان كمسودة بنجاح.',
        property: draftProperty,
      };
    }
  }

  // --- UPDATE ---
  async update(identityId: string, propertyId: string, dto: UpdatePropertyDto) {
    const existingProperty = await this.verifyOwnership(identityId, propertyId);
    const { isDraft, planSlotId, ...updateData } = dto;

    const isPublishingDraft =
      existingProperty.status === 'DRAFT' && isDraft === false;

    if (isPublishingDraft) {
      const published = await this.prisma.$transaction(async (tx) => {
        const imagesToCheck = updateData.images || existingProperty.images;
        const imagesCount = imagesToCheck?.length || 0;

        const quota = await this.quotaService.resolvePublishQuota(
          identityId,
          planSlotId || existingProperty.planSlotId,
          imagesCount,
          tx,
        );

        const endDate = new Date(
          Date.now() + quota.durationDays * 24 * 60 * 60 * 1000,
        );
        const isFeatured = quota.featuredDays > 0;
        const featuredUntil =
          quota.featuredDays > 0
            ? new Date(Date.now() + quota.featuredDays * 24 * 60 * 60 * 1000)
            : null;
        const isPriority = quota.prioritySearch;

        const publishedProperty = await tx.property.update({
          where: { id: propertyId },
          data: {
            ...updateData,
            status: ListingStatus.ACTIVE,
            planSlotId: quota.planSlotId,
            endDate,
            isFeatured,
            featuredUntil,
            isPriority,
            publishedAt: new Date(),
          },
        });

        return {
          message: 'تم نشر الإعلان بنجاح!',
          property: publishedProperty,
        };
      });
      this.notifyAlertMatches(published.property.id);
      return published;
    }

    let newStatus = existingProperty.status;
    if (isDraft === true) newStatus = ListingStatus.DRAFT;
    // Editing an archived ad keeps it archived: going live again has to go
    // through renew(), which spends a credit and sets new dates
    if (
      isDraft === false &&
      existingProperty.status !== ListingStatus.DRAFT &&
      !ARCHIVED_STATUSES.includes(existingProperty.status)
    )
      newStatus = ListingStatus.ACTIVE;

    const updatedProperty = await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        ...updateData,
        status: newStatus,
      },
    });

    if (
      newStatus === ListingStatus.ACTIVE &&
      existingProperty.status !== ListingStatus.ACTIVE
    ) {
      this.notifyAlertMatches(propertyId);
    }

    return {
      message: 'تم تحديث الإعلان بنجاح',
      property: updatedProperty,
    };
  }

  // --- DELETE ---
  async remove(identityId: string, propertyId: string, reason?: string) {
    await this.verifyOwnership(identityId, propertyId);

    if (reason) {
      await this.prisma.propertyDeletionLog.create({
        data: {
          propertyId,
          identityId,
          reason,
        },
      });
    }

    await this.prisma.property.delete({
      where: { id: propertyId },
    });

    return { message: 'تم حذف الإعلان بنجاح' };
  }

  // --- ARCHIVE PROPERTY ---
  async archive(identityId: string, propertyId: string) {
    await this.verifyOwnership(identityId, propertyId);
    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: ListingStatus.EXPIRED },
    });
    return {
      message: 'تم أرشفة الإعلان بنجاح',
      property: updated,
    };
  }

  // --- RENEW PROPERTY ---
  /**
   * Republishes an archived (expired/closed) ad, spending one credit: the
   * picked wallet slot, or the free ad / only slot when none is given.
   * The ad is claimed back to ACTIVE before the credit is spent, so two
   * concurrent requests can't both spend one; if spending fails the whole
   * transaction rolls back and the ad stays archived.
   */
  async renew(identityId: string, propertyId: string, planSlotId?: string) {
    const property = await this.verifyOwnership(identityId, propertyId);
    if (!ARCHIVED_STATUSES.includes(property.status)) {
      throw new BadRequestException('يمكن إعادة نشر الإعلانات المؤرشفة فقط');
    }
    const imagesCount = property.images?.length || 0;

    const renewed = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.property.updateMany({
        where: { id: propertyId, status: { in: ARCHIVED_STATUSES } },
        data: { status: ListingStatus.ACTIVE },
      });
      if (claimed.count === 0) {
        throw new ConflictException('تمت إعادة نشر هذا الإعلان بالفعل');
      }

      const quota = await this.quotaService.resolvePublishQuota(
        identityId,
        planSlotId,
        imagesCount,
        tx,
      );

      const now = Date.now();
      const updated = await tx.property.update({
        where: { id: propertyId },
        data: {
          status: ListingStatus.ACTIVE,
          planSlotId: quota.planSlotId,
          publishedAt: new Date(now),
          endDate: new Date(now + quota.durationDays * DAY_MS),
          isFeatured: quota.featuredDays > 0,
          featuredUntil:
            quota.featuredDays > 0
              ? new Date(now + quota.featuredDays * DAY_MS)
              : null,
          isPriority: quota.prioritySearch,
        },
      });

      return {
        message: 'تم تجديد نشر الإعلان بنجاح',
        property: updated,
      };
    });
    this.notifyAlertMatches(propertyId);
    return renewed;
  }

  // --- HELPER: Verify Ownership ---
  async verifyOwnership(identityId: string, propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('العقار غير موجود');
    }

    if (property.identityId !== identityId) {
      throw new UnauthorizedException('لا تملك صلاحية تعديل هذا الإعلان');
    }

    return property;
  }
}
