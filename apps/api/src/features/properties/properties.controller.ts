import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Patch,
  Get,
  Query,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import type { ListingStatus } from '@prisma/client';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { GetPropertiesFilterDto } from './dto/get-properties-filter.dto';
import type { RequestUser } from '../auth/strategies/jwt.strategy';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // Public Feed Endpoint
  @Get('feed/home')
  async getHomeFeed() {
    return this.propertiesService.getHomeFeed();
  }

  // Public Features Metadata Endpoint
  @Get('metadata/features')
  getFeatures() {
    return {
      sell: [
        { id: '1', label: 'بطن وظهر' },
        { id: '2', label: 'زاوية' },
        { id: '3', label: 'شارع واحد' },
        { id: '4', label: 'ثلاث شوارع' },
      ],
      rent: [
        { id: '1', label: 'مكيف' },
        { id: '2', label: 'اطلالة بحرية' },
        { id: '3', label: 'مصعد' },
        { id: '4', label: 'كراج' },
        { id: '5', label: 'حمام سباحة' },
      ],
      exchange: [
        { id: '1', label: 'بطن وظهر' },
        { id: '2', label: 'زاوية' },
        { id: '3', label: 'شارع واحد' },
        { id: '4', label: 'ارتداد كبير' },
      ],
    };
  }

  // My Activity Route
  @Get('/me/activity')
  @UseGuards(AuthGuard('jwt'))
  async getMyActivity(
    @CurrentUser() reqUser: RequestUser,
    @Query('status') status?: ListingStatus,
  ) {
    return this.propertiesService.getMyActivity(reqUser.identityId, status);
  }

  // Public Paginated Endpoint
  @Get()
  async findAll(@Query() filters: GetPropertiesFilterDto) {
    return this.propertiesService.findAll(filters);
  }

  // Public Single Property Endpoint
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  // Public View Tracking Endpoint
  @Patch(':id/view')
  async incrementViews(@Param('id') id: string) {
    return this.propertiesService.incrementViews(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @CurrentUser() reqUser: RequestUser,
    @Body() createPropertyDto: CreatePropertyDto,
  ) {
    return this.propertiesService.create(reqUser.identityId, createPropertyDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(reqUser.identityId, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto?: { reason?: string },
  ) {
    return this.propertiesService.remove(reqUser.identityId, id, dto?.reason);
  }
}
