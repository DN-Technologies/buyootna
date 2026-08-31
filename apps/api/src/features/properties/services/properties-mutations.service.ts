import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ListingStatus } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { PropertiesQuotaService } from './properties-quota.service';
import { generateReferenceNumber } from './property-formatting.util';

@Injectable()
export class PropertiesMutationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quotaService: PropertiesQuotaService,
  ) {}

  // --- CREATE ---
  async create(identityId: string, dto: CreatePropertyDto) {
    const { isDraft, planSlotId, ...propertyData } = dto;
    const targetStatus = isDraft ? ListingStatus.DRAFT : ListingStatus.ACTIVE;

    if (!isDraft) {
      return await this.prisma.$transaction(async (tx) => {
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
          },
        });

        return {
          message: 'تم إضافة الاعلان بنجاح!',
          property: newProperty,
        };
      });
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
      return await this.prisma.$transaction(async (tx) => {
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
          },
        });

        return {
          message: 'تم نشر الإعلان بنجاح!',
          property: publishedProperty,
        };
      });
    }

    let newStatus = existingProperty.status;
    if (isDraft === true) newStatus = ListingStatus.DRAFT;
    if (isDraft === false && existingProperty.status !== 'DRAFT')
      newStatus = ListingStatus.ACTIVE;

    const updatedProperty = await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        ...updateData,
        status: newStatus,
      },
    });

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
  async renew(identityId: string, propertyId: string, planSlotId?: string) {
    const property = await this.verifyOwnership(identityId, propertyId);
    const imagesCount = property.images?.length || 0;

    return await this.prisma.$transaction(async (tx) => {
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

      const updated = await tx.property.update({
        where: { id: propertyId },
        data: {
          status: ListingStatus.ACTIVE,
          planSlotId: quota.planSlotId,
          endDate,
          isFeatured,
          featuredUntil,
          isPriority,
        },
      });

      return {
        message: 'تم تجديد نشر الإعلان بنجاح',
        property: updated,
      };
    });
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
