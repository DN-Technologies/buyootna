import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ListingStatus, Prisma } from '@prisma/client';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { StorageService } from 'src/core/storage/storage.service';
import { GetPropertiesFilterDto } from './dto/get-properties-filter.dto';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  // --- PUBLIC FEED ---
  async getHomeFeed() {
    const [saleProperties, rentProperties, exchangeProperties, topCompanies] =
      await Promise.all([
        this.prisma.property.findMany({
          where: { type: 'SALE', status: 'ACTIVE' },
          orderBy: [
            { isPriority: 'desc' },
            { isFeatured: 'desc' },
            { createdAt: 'desc' },
          ],
          take: 5,
          include: {
            identity: {
              select: {
                id: true,
                type: true,
                individualData: { select: { name: true } },
                companyData: { select: { name: true } },
                officeData: { select: { name: true } },
              },
            },
          },
        }),

        this.prisma.property.findMany({
          where: { type: 'RENT', status: 'ACTIVE' },
          orderBy: [
            { isPriority: 'desc' },
            { isFeatured: 'desc' },
            { createdAt: 'desc' },
          ],
          take: 5,
          include: {
            identity: {
              select: {
                id: true,
                type: true,
                individualData: { select: { name: true } },
                companyData: { select: { name: true } },
                officeData: { select: { name: true } },
              },
            },
          },
        }),

        this.prisma.property.findMany({
          where: { type: 'EXCHANGE', status: 'ACTIVE' },
          orderBy: [
            { isPriority: 'desc' },
            { isFeatured: 'desc' },
            { createdAt: 'desc' },
          ],
          take: 5,
          include: {
            identity: {
              select: {
                id: true,
                type: true,
                individualData: { select: { name: true } },
                companyData: { select: { name: true } },
                officeData: { select: { name: true } },
              },
            },
          },
        }),

        // Top companies - using identity-based query
        this.prisma.identity.findMany({
          where: {
            type: 'COMPANY',
            companyData: {
              isNot: null,
              is: { status: 'APPROVED' },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            companyData: true,
          },
        }),
      ]);

    return {
      sale: this.formatProperties(saleProperties),
      rent: this.formatProperties(rentProperties),
      exchange: this.formatProperties(exchangeProperties),
      companies: this.formatCompanies(topCompanies),
    };
  }

  // --- PAGINATED FEED (For Infinite Scroll) ---
  async findAll(filters: GetPropertiesFilterDto) {
    const { type, page = 1, limit = 10, identityId } = filters;

    const skip = (page - 1) * limit;

    const whereClause: Prisma.PropertyWhereInput = { status: 'ACTIVE' };
    if (type) {
      whereClause.type = type;
    }
    if (identityId) {
      whereClause.identityId = identityId;
    }

    const [properties, totalCount] = await Promise.all([
      this.prisma.property.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: [
          { isPriority: 'desc' },
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          identity: {
            select: {
              id: true,
              type: true,
              individualData: { select: { name: true } },
              companyData: { select: { name: true } },
              officeData: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.property.count({ where: whereClause }),
    ]);

    return {
      data: this.formatProperties(properties),
      meta: {
        total: totalCount,
        current: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
      },
    };
  }

  private generateReferenceNumber(): number {
    return Math.floor(1000000 + Math.random() * 9000000);
  }

  private async resolvePublishQuota(
    identityId: string,
    requestedSlotId: string | null | undefined,
    imagesCount: number,
    tx: Prisma.TransactionClient,
  ) {
    const identity = await tx.identity.findUnique({
      where: { id: identityId },
      select: { id: true, userId: true },
    });

    if (!identity) throw new NotFoundException('الهوية غير موجودة');

    // Check free ads remaining on user level (legacy)
    const user = await tx.user.findUnique({
      where: { id: identity.userId },
      select: { id: true, freeAdsRemaining: true },
    });

    if (!user) throw new NotFoundException('المستخدم غير موجود');

    // 1. If explicit FREE_QUOTA or no slot specified and freeAdsRemaining > 0
    if (
      requestedSlotId === 'FREE_QUOTA' ||
      (!requestedSlotId && (user.freeAdsRemaining ?? 0) > 0)
    ) {
      if ((user.freeAdsRemaining ?? 0) <= 0) {
        throw new ForbiddenException(
          'لقد استنفذت الإعلان المجاني الترحيبي الخاص بك.',
        );
      }

      await tx.user.update({
        where: { id: identity.userId },
        data: { freeAdsRemaining: { decrement: 1 } },
      });

      return {
        planSlotId: null,
        durationDays: 10,
        maxImagesPerAd: 5,
        featuredDays: 0,
        prioritySearch: false,
      };
    }

    // 2. Specific Plan Slot requested OR auto-select single available slot
    let targetSlotId = requestedSlotId;

    if (!targetSlotId) {
      const activeSlots = await tx.userPlanSlot.findMany({
        where: { identityId, status: 'ACTIVE', adsRemaining: { gt: 0 } },
        orderBy: { createdAt: 'desc' },
      });

      if (activeSlots.length === 1) {
        targetSlotId = activeSlots[0].id;
      } else if (activeSlots.length === 0) {
        throw new ForbiddenException(
          'ليس لديك رصيد إعلانات نشط. يرجى شراء باقة إعلانات لنشر إعلان جديد.',
        );
      } else {
        throw new BadRequestException(
          'لديك أكثر من باقة في محفظتك. يرجى اختيار الباقة المراد النشر منها.',
        );
      }
    }

    const slot = await tx.userPlanSlot.findFirst({
      where: {
        id: targetSlotId,
        identityId,
        status: 'ACTIVE',
        adsRemaining: { gt: 0 },
      },
      include: { plan: true },
    });

    if (!slot) {
      throw new ForbiddenException(
        'الباقة المحددة غير صالحة أو غير متبقي فيها إعلانات.',
      );
    }

    if (imagesCount > slot.plan.maxImagesPerAd) {
      throw new BadRequestException(
        `الباقة المحددة (${slot.plan.name}) تسمح بـ ${slot.plan.maxImagesPerAd} صور كحد أقصى لكل إعلان.`,
      );
    }

    const newAdsRemaining = slot.adsRemaining - 1;
    await tx.userPlanSlot.update({
      where: { id: slot.id },
      data: {
        adsRemaining: newAdsRemaining,
        status: newAdsRemaining <= 0 ? 'EXHAUSTED' : 'ACTIVE',
      },
    });

    return {
      planSlotId: slot.id,
      durationDays: slot.plan.durationDays,
      maxImagesPerAd: slot.plan.maxImagesPerAd,
      featuredDays: slot.plan.featuredDays,
      prioritySearch: slot.plan.prioritySearch,
    };
  }

  // --- CREATE ---
  async create(identityId: string, dto: CreatePropertyDto) {
    const { isDraft, planSlotId, ...propertyData } = dto;
    const targetStatus = isDraft ? ListingStatus.DRAFT : ListingStatus.ACTIVE;

    if (!isDraft) {
      return await this.prisma.$transaction(async (tx) => {
        const imagesCount = propertyData.images?.length || 0;
        const quota = await this.resolvePublishQuota(
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
          referenceNumber = this.generateReferenceNumber();
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
        referenceNumber = this.generateReferenceNumber();
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

        const quota = await this.resolvePublishQuota(
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

  // --- GET SINGLE PROPERTY BY ID ---
  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        identity: {
          select: {
            id: true,
            type: true,
            createdAt: true,
            individualData: {
              select: { name: true, avatarUrl: true },
            },
            companyData: {
              select: { name: true, logoUrl: true, isVerified: true },
            },
            officeData: {
              select: {
                name: true,
                logoUrl: true,
                isVerified: true,
                licenseNumber: true,
              },
            },
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('عذراً، هذا العقار غير موجود أو تم حذفه');
    }

    const identity = property.identity;
    const hostName =
      identity?.officeData?.name ||
      identity?.companyData?.name ||
      identity?.individualData?.name ||
      'مستخدم';
    const hostAvatar =
      identity?.officeData?.logoUrl ||
      identity?.companyData?.logoUrl ||
      identity?.individualData?.avatarUrl ||
      'https://via.placeholder.com/150';
    const isVerified =
      identity?.officeData?.isVerified ||
      identity?.companyData?.isVerified ||
      false;

    return {
      ...property,
      host: {
        id: identity?.id,
        name: hostName,
        avatarUrl: hostAvatar,
        joinedDate: identity
          ? this.formatDateToMonthYear(identity.createdAt)
          : '',
        isVerified,
        rating: 4.5,
        role: identity?.type || 'INDIVIDUAL',
      },
      licenseNumber: identity?.officeData?.licenseNumber || undefined,
    };
  }

  // --- MY ACTIVITY FETCHER ---
  async getMyActivity(identityId: string, statusFilter?: ListingStatus) {
    const whereClause: Prisma.PropertyWhereInput = { identityId };

    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    const properties = await this.prisma.property.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
    });

    return properties.map((p) => ({
      id: p.id,
      images: p.images,
      price: p.price,
      type: p.type === 'SALE' ? 'بيع' : p.type === 'RENT' ? 'إيجار' : 'بدل',
      category: p.category,
      status: p.status,
      updatedAt: p.updatedAt,
      isPremium: p.isFeatured,
      isHidden: p.isHidden,
      location: p.location,
      description: p.description,
      automatedNumber: p.automatedNumber,
      beds: p.beds,
      baths: p.baths,
      areaSize: p.areaSize,
      floors: p.floors,
      views: p.views,
    }));
  }

  // --- INCREMENT VIEW COUNT ---
  async incrementViews(id: string) {
    try {
      await this.prisma.property.update({
        where: { id },
        data: {
          views: {
            increment: 1,
          },
        },
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  // --- HELPER: Verify Ownership ---
  private async verifyOwnership(identityId: string, propertyId: string) {
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

  // --- Helpers to clean the data before sending it to the mobile app ---
  private formatProperties(properties: any[]) {
    return properties.map((p) => {
      const identity = p.identity;
      const displayName =
        identity?.companyData?.name ||
        identity?.officeData?.name ||
        identity?.individualData?.name ||
        'مستخدم';

      return {
        id: p.id,
        images: p.images,
        price: p.price,
        companyName: displayName,
        isFeatured: p.isFeatured,
        type:
          p.category === 'RESIDENTIAL'
            ? 'سكني'
            : p.category === 'COMMERCIAL'
              ? 'تجاري'
              : 'استثماري',
        area: p.areaSize,
        beds: p.beds,
        baths: p.baths,
        location: p.location,
        createdAt: p.createdAt,
        phoneNumber: p.phoneNumber,
        identityId: identity?.id,
        identityType: identity?.type,
      };
    });
  }

  private formatCompanies(identities: any[]) {
    return identities
      .filter((i) => i.companyData !== null)
      .map((i) => ({
        id: i.id,
        name: i.companyData!.name,
        category: i.companyData!.services || '',
        rating: 4.5,
        projectsCount: '+50',
        serviceArea: i.companyData!.serviceAreas,
        logoUrl: i.companyData!.logoUrl,
        isVerified: i.companyData!.isVerified,
      }));
  }

  private formatDateToMonthYear(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  }
}
