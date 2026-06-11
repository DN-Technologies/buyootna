import { Module } from '@nestjs/common';
import { MediaController } from 'src/media/media.controller';

@Module({
  controllers: [MediaController],
  // We do not need to provide StorageService here because StorageModule is a global module
})
export class MediaModule {}
