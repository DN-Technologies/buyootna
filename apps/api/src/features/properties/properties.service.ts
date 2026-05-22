import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { StorageService } from 'src/core/storage/storage.service';

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

  // --- CREATE ---
  async create(
    userId: string,
    dto: CreatePropertyDto,
    files: Express.Multer.File[],
  ) {
    // 1. Upload all images to AWS S3 concurrently
    const imageUrls = await this.storageService.uploadMultipleFiles(
      files,
      'properties',
    );

    // 2. Save property database
    const property = await this.prisma.property.create({
      data: {
        ...dto,
        images: imageUrls,
        userId: userId, // Link it to the user who created it
      },
    });

    return property;
  }

  // --- UPDATE ---
  async update(userId: string, propertyId: string, dto: UpdatePropertyDto) {
    await this.verifyOwnership(userId, propertyId);

    // Note: If we want to allow image updates later, we'd handle S3 deletions and new uploads here
    return this.prisma.property.update({
      where: { id: propertyId },
      data: dto,
    });
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
      area: p.area,
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
        category: c.companyProfile!.services,
        rating: 4.5, // TODO: Implement real ratings later
        projectsCount: '+50', // TODO: Make dynamic later
        serviceArea: c.companyProfile!.serviceAreas,
        logoUrl: c.companyProfile!.logoUrl,
        isVerified: true,
      }));
  }
}

interface PropertyWithCompanyUser {
  id: string;
  images: string[];
  price: number;
  isFeatured: boolean;
  category: string;
  area: number;
  beds: number;
  baths: number;
  location: string;
  user: {
    companyProfile: {
      name: string;
    } | null;
  };
}

interface CompanyUserProfile {
  companyProfile: {
    id: string;
    name: string;
    services: string;
    serviceAreas: string;
    logoUrl: string | null;
  } | null;
}
