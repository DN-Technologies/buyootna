import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import heicConvert from 'heic-convert';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StorageService } from 'src/core/storage/storage.service';
import { ApiCommonErrors } from '../core/swagger/api-common-errors.decorator';
import { JwtAuthGuard } from '../features/auth/guards/jwt-auth.guard';
import {
  UploadAvatarResponseDto,
  UploadListingImagesResponseDto,
} from './dto/media-response.dto';

// Signed-in users only: every upload in the apps happens after login, and
// an open endpoint let anyone store files in the S3 bucket
@ApiTags('Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary:
      'Upload a single avatar/logo image (HEIC/HEIF auto-converted to JPEG)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 201, type: UploadAvatarResponseDto })
  @ApiCommonErrors()
  async uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: '.(png|jpeg|jpg|webp|heic|heif|HEIC|HEIF)',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    let processedFile = file;
    if (
      ext === 'heic' ||
      ext === 'heif' ||
      file.mimetype === 'image/heic' ||
      file.mimetype === 'image/heif'
    ) {
      try {
        const outputBuffer = await heicConvert({
          buffer: file.buffer,
          format: 'JPEG',
          quality: 0.8,
        });
        const newFilename = file.originalname.replace(
          /\.(heic|heif)$/i,
          '.jpg',
        );
        processedFile = {
          ...file,
          buffer: Buffer.from(outputBuffer),
          originalname: newFilename,
          mimetype: 'image/jpeg',
        };
      } catch (error) {
        console.error('Failed to convert HEIC/HEIF avatar to JPEG:', error);
      }
    }

    const uploadedUrl = await this.storageService.uploadFile(
      processedFile,
      'avatars',
    );

    return {
      message: 'تم رفع الصورة بنجاح',
      url: uploadedUrl,
    };
  }

  @Post('upload/listings')
  @UseInterceptors(FilesInterceptor('images', 10)) // Accepts up to 10 files under the 'images' key
  @ApiOperation({
    summary:
      'Upload up to 10 listing images (HEIC/HEIF auto-converted to JPEG)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: UploadListingImagesResponseDto })
  @ApiCommonErrors()
  async uploadListingImages(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          // Enforce 10MB limit per file to prevent abuse
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          // Accept standard web image formats and iOS HEIC/HEIF formats
          new FileTypeValidator({
            fileType: '.(png|jpeg|jpg|webp|heic|heif|HEIC|HEIF)',
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    // Transcode any HEIC/HEIF images to JPEG format to ensure compatibility with browsers and devices
    const processedFiles: Express.Multer.File[] = await Promise.all(
      files.map(async (file) => {
        const ext = file.originalname.split('.').pop()?.toLowerCase();
        if (
          ext === 'heic' ||
          ext === 'heif' ||
          file.mimetype === 'image/heic' ||
          file.mimetype === 'image/heif'
        ) {
          try {
            const outputBuffer = await heicConvert({
              buffer: file.buffer,
              format: 'JPEG',
              quality: 0.8,
            });

            // Replace original file extension and mimetype with .jpg and image/jpeg
            const newFilename = file.originalname.replace(
              /\.(heic|heif)$/i,
              '.jpg',
            );

            return {
              ...file,
              buffer: Buffer.from(outputBuffer),
              originalname: newFilename,
              mimetype: 'image/jpeg',
            };
          } catch (error) {
            console.error('Failed to convert HEIC/HEIF file to JPEG:', error);
            // Fallback to original file if conversion fails
            return file;
          }
        }
        return file;
      }),
    );

    // Pass files to existing global service, saving them in the 'listings' folder
    const uploadedUrls = await this.storageService.uploadMultipleFiles(
      processedFiles,
      'listings',
    );

    return {
      message: 'تم رفع الصور بنجاح',
      urls: uploadedUrls,
    };
  }
}
