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
import { StorageService } from 'src/core/storage/storage.service';

@Controller('media')
export class MediaController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload/listings')
  @UseInterceptors(FilesInterceptor('images', 10)) // Acceptes up to 10 files under the 'images' key
  async uploadListingImages(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          // Enforce 10MB limit per file to prevent abuse
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          // Accept only standard web image formats
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    // Pass files to existing global service, saving them in the 'listings' folder
    const uploadedUrls = await this.storageService.uploadMultipleFiles(
      files,
      'listings',
    );

    return {
      message: 'تم رفع الصور بنجاح',
      urls: uploadedUrls,
    };
  }
}
