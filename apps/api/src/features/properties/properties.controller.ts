import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Patch,
  Get,
  Query,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { GetPropertiesFilterDto } from './dto/get-properties-filter.dto';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // Public Feed Endpoint
  @Get('feed/home')
  async getHomeFeed() {
    return this.propertiesService.getHomeFeed();
  }

  // Public Paginated Endpoint
  @Get()
  async findAll(@Query() filters: GetPropertiesFilterDto) {
    return this.propertiesService.findAll(filters);
  }

  @UseGuards(AuthGuard('jwt'))
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

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.propertiesService.remove(user.id, id);
  }
}
