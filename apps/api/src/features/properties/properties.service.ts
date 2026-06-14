import {
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
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            user: {
              select: {
                companyProfile: { select: { name: true } },
              },
            },
          },
        }),

        // 2. Latest 5 properties for RENT
        this.prisma.property.findMany({
          where: { type: 'RENT' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            user: {
              select: {
                companyProfile: { select: { name: true } },
              },
            },
          },
        }),

        // 3. Latest 5 properties for EXCHANGE
        this.prisma.property.findMany({
          where: { type: 'EXCHANGE' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            user: {
              select: {
                companyProfile: { select: { name: true } },
              },
            },
          },
        }),

        // 4. Top 5 Companies (Users with Role = Company who have a profile)
        this.prisma.user.findMany({
          where: { role: 'COMPANY', companyProfile: { isNot: null } },
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
    const { type, page = 1, limit = 10 } = filters;

    // Calculate how many records to skip based on the curretn page
    const skip = (page - 1) * limit;

    // Build the dynamic 'where' clause
    const whereClause: Prisma.PropertyWhereInput = {};
    if (type) {
      whereClause.type = type;
    }

    // Run both queries concurrently: get the data AND the total count
    const [properties, totalCount] = await Promise.all([
      this.prisma.property.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
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

  // --- CREATE ---
  async create(userId: string, dto: CreatePropertyDto) {
    // 1. Separate the meta flag from the actual database fields
    const { isDraft, ...propertyData } = dto;

    // 2. Determine target status
    const targetStatus = isDraft ? ListingStatus.DRAFT : ListingStatus.ACTIVE;

    // ==========================================
    // PATH A: PUBLISHING A LIVE AD
    // ==========================================
    if (!isDraft) {
      // We use a Prisma $transaction. If any part of this fails, the whole rolls back.
      return await this.prisma.$transaction(async (tx) => {
        // Check the user's remaining free ads
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { freeAdsRemaining: true },
        });

        if (!user) {
          throw new NotFoundException('المستخدم غير موجود');
        }

        if (user.freeAdsRemaining <= 0) {
          throw new ForbiddenException(
            'ليس لديك إعلانات مجانية متبقية. يرجى شراء باقة إعلانية لنشر هذا العقار.',
          );
        }

        // Create the property
        const newProperty = await tx.property.create({
          data: {
            ...propertyData,
            status: targetStatus,
            userId: userId,
          },
        });

        // Deduct 1 from their quota
        await tx.user.update({
          where: { id: userId },
          data: { freeAdsRemaining: { decrement: 1 } },
        });

        return {
          message: 'تم إضافة الاعلان بنجاح!',
          property: newProperty,
        };
      });
    }

    // ==========================================
    // PATH B: SAVING AS A DRAFT
    // ==========================================
    else {
      // Just save the data, no quota deduction required
      const draftProperty = await this.prisma.property.create({
        data: {
          ...propertyData,
          status: targetStatus,
          userId: userId,
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
    // 1. Verfiy the user owns this property
    const existingProperty = await this.verifyOwnership(userId, propertyId);

    // 2. Extract isDraft to determine if this is a "Publish" action
    const { isDraft, ...updateData } = dto;

    // Check if the user is trying to publish a draft
    const isPublishingDraft =
      existingProperty.status === 'DRAFT' && isDraft === false;

    // ==========================================
    // PATH A: PUBLISHING A SAVED DRAFT
    // ==========================================
    if (isPublishingDraft) {
      return await this.prisma.$transaction(async (tx) => {
        // Step A1: Check Quota
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { freeAdsRemaining: true },
        });

        if (!user || user.freeAdsRemaining <= 0) {
          throw new ForbiddenException(
            'ليس لديك إعلانات مجانية متبقية. يرجى شراء باقة إعلانية لنشر هذا العقار.',
          );
        }

        // Step A2: Update the property to ACTIVE
        const publishedProperty = await tx.property.update({
          where: { id: propertyId },
          data: {
            ...updateData,
            status: ListingStatus.ACTIVE,
          },
        });

        // Step A3: Deduct Quota
        await tx.user.update({
          where: { id: userId },
          data: { freeAdsRemaining: { decrement: 1 } },
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
  async remove(userId: string, propertyId: string) {
    await this.verifyOwnership(userId, propertyId);

    // TODO: Optionally loop throght property.images and delete them from AWS S3 to save space

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
        name: property.user.companyProfile
          ? property.user.companyProfile.name
          : 'مستخدم',
        avatarUrl:
          property.user.companyProfile?.logoUrl ||
          'https://via.placeholder.com/150',
        joinedDate: this.formatDateToMonthYear(property.user.createdAt),
        isVerified: property.user.companyProfile?.isVerified ?? false,
        rating: 4.5, // TODO: Make dynamic when ratings system is built
      },
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
      // If it's a company, show their name. Otherwise, show "مستخدم" (User)
      companyName: p.user.companyProfile
        ? p.user.companyProfile.name
        : 'مستخدم',
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
