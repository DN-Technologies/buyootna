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
}
