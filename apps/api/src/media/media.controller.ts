import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import heicConvert from 'heic-convert';
import { StorageService } from 'src/core/storage/storage.service';

@Controller('media')
export class MediaController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload/listings')
  @UseInterceptors(FilesInterceptor('images', 10)) // Accepts up to 10 files under the 'images' key
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
