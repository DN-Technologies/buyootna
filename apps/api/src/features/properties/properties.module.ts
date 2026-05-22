import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { StorageModule } from 'src/core/storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [PropertiesController],
  providers: [PropertiesService],
})
export class PropertiesModule {}
