import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('properties')
@UseGuards(AuthGuard('jwt')) // Locks down all endpoints in this controller
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10)) // Accept up to 10 files in 'images field
  async create(
    @CurrentUser() user: User,
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Pass the user.userId (from our JWT payload) top the service
    return this.propertiesService.create(user.id, createPropertyDto, files);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.propertiesService.remove(user.id, id);
  }
}
