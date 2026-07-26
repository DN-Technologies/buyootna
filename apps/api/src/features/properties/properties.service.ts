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
import {
  CompanyUserProfile,
  PropertyWithCompanyUser,
} from './types/properties.interface';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  // --- PUBLIC FEED ---
  async getHomeFeed() {
    // Run all 4 queries concurrently for maximum speed
    const [saleProperties, rentProperties, exchangeProperties, topCompanies] =
      await Promise.all([
        // 1. Latest 5 properties for SALE
        this.prisma.property.findMany({
          where: { type: 'SALE' },
          orderBy: [
            { isPriority: 'desc' },
            { isFeatured: 'desc' },
            { createdAt: 'desc' },
          ],
          take: 5,
          include: {
            user: {
              select: {
                name: true,
                companyProfile: { select: { name: true } },
              },
            },
          },
        }),

        // 2. Latest 5 properties for RENT
        this.prisma.property.findMany({
          where: { type: 'RENT' },
          orderBy: [
            { isPriority: 'desc' },
            { isFeatured: 'desc' },
            { createdAt: 'desc' },
          ],
          take: 5,
          include: {
            user: {
              select: {
                name: true,
                companyProfile: { select: { name: true } },
              },
            },
          },
        }),

        // 3. Latest 5 properties for EXCHANGE
        this.prisma.property.findMany({
          where: { type: 'EXCHANGE' },
          orderBy: [
            { isPriority: 'desc' },
            { isFeatured: 'desc' },
            { createdAt: 'desc' },
          ],
          take: 5,
          include: {
            user: {
              select: {
                name: true,
                companyProfile: { select: { name: true } },
              },
            },
          },
        }),

        // 4. Top 5 Companies (Users with Role = Company who have an approved profile)
        this.prisma.user.findMany({
          where: {
            role: 'COMPANY',
            companyProfile: {
              isNot: null,
              is: {
                status: 'APPROVED',
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            companyProfile: true,
          },
        }),
      ]);

    // Format the response to perfetly match what the React Native app expects
    return {
      sale: this.formatProperties(saleProperties),
      rent: this.formatProperties(rentProperties),
      exchange: this.formatProperties(exchangeProperties),
      companies: this.formatCompanies(topCompanies),
    };
  }

  // --- PAGINATED FEED (For Infinite Scroll) ---
  async findAll(filters: GetPropertiesFilterDto) {
    const { type, page = 1, limit = 10, userId } = filters;

    // Calculate how many records to skip based on the curretn page
    const skip = (page - 1) * limit;

    // Build the dynamic 'where' clause
    const whereClause: Prisma.PropertyWhereInput = {};
    if (type) {
      whereClause.type = type;
    }
    if (userId) {
      whereClause.userId = userId;
    }

    // Run both queries concurrently: get the data AND the total count
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
          user: {
            select: {
              name: true,
              companyProfile: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.property.count({ where: whereClause }),
    ]);

    // Return the formatted data along with pagination metadata
    return {
      data: this.formatProperties(properties), // Re-using our helper from HomeFeed!
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

  private async getUserPlan(userId: string, tx?: Prisma.TransactionClient) {
    const prismaClient = tx || this.prisma;
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      include: { activePlan: true },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    if (user.activePlan) {
      return { user, plan: user.activePlan };
    }

    const defaultPlan = await prismaClient.plan.findUnique({
      where: { slug: 'regular' },
    });

    const fallbackPlan = defaultPlan || {
      id: 'regular',
      slug: 'regular',
      name: 'العادية',
      maxActiveAds: 1,
      durationDays: 10,
      maxImagesPerAd: 5,
      featuredDays: 0,
      prioritySearch: false,
    };

    return { user, plan: fallbackPlan };
  }

  private async resolvePublishQuota(
    userId: string,
    requestedSlotId: string | null | undefined,
    imagesCount: number,
    tx: Prisma.TransactionClient,
  ) {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, freeAdsRemaining: true },
    });

    if (!user) throw new NotFoundException('المستخدم غير موجود');

    // 1. If explicit FREE_QUOTA or no slot specified and freeAdsRemaining > 0
    if (
      requestedSlotId === 'FREE_QUOTA' ||
      (!requestedSlotId && user.freeAdsRemaining > 0)
    ) {
      if (user.freeAdsRemaining <= 0) {
        throw new ForbiddenException(
          'لقد استنفذت الإعلان المجاني الترحيبي الخاص بك.',
        );
      }

      await tx.user.update({
        where: { id: userId },
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
        where: { userId, status: 'ACTIVE', adsRemaining: { gt: 0 } },
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
        userId,
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
  async create(userId: string, dto: CreatePropertyDto) {
    const { isDraft, planSlotId, ...propertyData } = dto;
    const targetStatus = isDraft ? ListingStatus.DRAFT : ListingStatus.ACTIVE;

    if (!isDraft) {
      return await this.prisma.$transaction(async (tx) => {
        const imagesCount = propertyData.images?.length || 0;
        const quota = await this.resolvePublishQuota(
          userId,
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
            userId,
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
          userId,
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
  async update(userId: string, propertyId: string, dto: UpdatePropertyDto) {
    const existingProperty = await this.verifyOwnership(userId, propertyId);
    const { isDraft, planSlotId, ...updateData } = dto;

    const isPublishingDraft =
      existingProperty.status === 'DRAFT' && isDraft === false;

    if (isPublishingDraft) {
      return await this.prisma.$transaction(async (tx) => {
        const imagesToCheck = updateData.images || existingProperty.images;
        const imagesCount = imagesToCheck?.length || 0;

        const quota = await this.resolvePublishQuota(
          userId,
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

    // ==========================================
    // PATH B: NORMAL UPDATE (Editing an already active ad, or just editing a draft)
    // ==========================================
    // If they explicitly send isDraft, update the status accordingly
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
  async remove(userId: string, propertyId: string, reason?: string) {
    await this.verifyOwnership(userId, propertyId);

    // TODO: Optionally loop throght property.images and delete them from AWS S3 to save space

    if (reason) {
      await this.prisma.propertyDeletionLog.create({
        data: {
          propertyId,
          userId,
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
        // Fetch the user how posted it, but ONLY specific fields
        user: {
          select: {
            id: true,
            createdAt: true, // We need this for the "Joined in..." date
            companyProfile: {
              select: {
                name: true,
                logoUrl: true,
                isVerified: true,
              },
            },
            officeProfile: {
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

    // Format the response to perfectly match UI expects
    return {
      ...property,
      // Create a clean 'host' object for the frontend
      host: {
        id: property.user.id,
        name: property.user.officeProfile
          ? property.user.officeProfile.name
          : property.user.companyProfile
            ? property.user.companyProfile.name
            : 'مستخدم',
        avatarUrl:
          property.user.officeProfile?.logoUrl ||
          property.user.companyProfile?.logoUrl ||
          'https://via.placeholder.com/150',
        joinedDate: this.formatDateToMonthYear(property.user.createdAt),
        isVerified:
          property.user.officeProfile?.isVerified ||
          property.user.companyProfile?.isVerified ||
          false,
        rating: 4.5, // TODO: Make dynamic when ratings system is built
        role: property.user.officeProfile
          ? 'OFFICE'
          : property.user.companyProfile
            ? 'COMPANY'
            : 'INDIVIDUAL',
      },
      licenseNumber: property.user.officeProfile?.licenseNumber || undefined,
    };
  }

  // --- MY ACTIVITY FETCHER ---
  async getMyActivity(userId: string, statusFilter?: ListingStatus) {
    const whereClause: Prisma.PropertyWhereInput = { userId };

    // If the frontend  passed a specific tab filter (e.g., ?status=DRAFT)
    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    const properties = await this.prisma.property.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' }, // Show newest activity first
    });

    // Format for the ActivityCard on the frontend
    return properties.map((p) => ({
      id: p.id,
      images: p.images,
      price: p.price,
      type: p.type === 'SALE' ? 'بيع' : p.type === 'RENT' ? 'إيجار' : 'بدل',
      category: p.category,
      status: p.status, // Tells the frontend whether to show "Publish" or "Edit" button
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
            increment: 1, // Atomic operation at the database level
          },
        },
      });
      return { success: true };
    } catch {
      // If the property doesn't exist, we just fail silently.
      // It's just a view counter, no need to alert the user.
      return { success: false };
    }
  }

  // --- HELPER: Verify Ownership ---
  private async verifyOwnership(userId: string, propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('العقار غير موجود');
    }

    if (property.userId !== userId) {
      throw new UnauthorizedException('لا تملك صلاحية تعديل هذا الإعلان');
    }

    return property;
  }

  // --- Helpers to clean the data before sending it to the mobile app ---
  private formatProperties(properties: PropertyWithCompanyUser[]) {
    return properties.map((p) => ({
      id: p.id,
      images: p.images,
      price: p.price,
      // If it's a company, show their name. Otherwise, show user name or "مستخدم" (User)
      companyName: p.user.companyProfile
        ? p.user.companyProfile.name
        : p.user.name || 'مستخدم',
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
    }));
  }

  private formatCompanies(companies: CompanyUserProfile[]) {
    return companies
      .filter((c) => c.companyProfile !== null)
      .map((c) => ({
        id: c.companyProfile!.id,
        name: c.companyProfile!.name,
        category: c.companyProfile!.services || '',
        rating: 4.5, // TODO: Implement real ratings later
        projectsCount: '+50', // TODO: Make dynamic later
        serviceArea: c.companyProfile!.serviceAreas,
        logoUrl: c.companyProfile!.logoUrl,
        isVerified: c.companyProfile!.isVerified,
      }));
  }

  // Helper method to format dates like "06/2026" for the UI
  private formatDateToMonthYear(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  }
}
