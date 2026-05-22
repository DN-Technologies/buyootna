import { PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME;
  private readonly region = process.env.AWS_REGION;

  constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    const s3Config: S3ClientConfig = {
      region: this.region,
    };

    if (accessKeyId && secretAccessKey) {
      s3Config.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }

    this.s3Client = new S3Client(s3Config);
  }

  // Uploads a file directly from memory buffer to S3
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      // Generate a unique filename: folder-name/uuid.extension
      const fileExtension = extname(file.originalname);
      const uniqueFileName = `${folder}/${uuidv4()}${fileExtension}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: uniqueFileName,
          Body: file.buffer,
          ContentType: file.mimetype,
          // ACL: 'public-read', // Uncomment if your bucket allows public ACLs
        }),
      );

      // Return the public URL to save in the database
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${uniqueFileName}`;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new InternalServerErrorException('فشل في رفع الملف');
    }
  }
  // Multiple File Uploads
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    try {
      // Map over the array of files and call the single upload logic for each one.
      // We use Promise.all to execute all S3 uploads in parallel for maximum speed.
      const uploadPromises = files.map((file) => this.uploadFile(file, folder));

      // Wait for all uploads to finish, then return the array of resulting S3 URLs
      const uploadedUrls = await Promise.all(uploadPromises);

      return uploadedUrls;
    } catch (error) {
      console.error('S3 Multiple Upload Error:', error);
      // If even one fails, we throw an error to prevent partial listing creation
      throw new InternalServerErrorException(
        'فشل في رفع بعض الصور، يرجى المحاولة مرة أخرى',
      );
    }
  }
}
