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
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { OptionalJwtGuard } from 'src/core/guards/optional-jwt.guard';
import type { ListingStatus } from '@prisma/client';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { RenewPropertyDto } from './dto/renew-property.dto';
import { GetPropertiesFilterDto } from './dto/get-properties-filter.dto';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import {
  HomeFeedResponseDto,
  IncrementViewsResponseDto,
  MyActivityPropertyDto,
  PropertyDto,
  PropertyListResponseDto,
  RemovePropertyResponseDto,
} from './dto/property-response.dto';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // Public Feed Endpoint
  // Signed in, the ads of accounts blocked either way are left out
  @UseGuards(OptionalJwtGuard)
  @Get('feed/home')
  @ApiOperation({
    summary:
      'Get the home feed: top sale/rent/exchange listings and top companies',
  })
  @ApiResponse({ status: 200, type: HomeFeedResponseDto })
  @ApiCommonErrors()
  async getHomeFeed(@CurrentUser() reqUser?: RequestUser) {
    return this.propertiesService.getHomeFeed(reqUser?.userId);
  }

  // Public Features Metadata Endpoint
  @Get('metadata/features')
  @ApiOperation({
    summary:
      'Get the static list of selectable property features, grouped by listing type',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        sell: {
          type: 'array',
          items: {
            type: 'object',
            properties: { id: { type: 'string' }, label: { type: 'string' } },
          },
        },
        rent: {
          type: 'array',
          items: {
            type: 'object',
            properties: { id: { type: 'string' }, label: { type: 'string' } },
          },
        },
        exchange: {
          type: 'array',
          items: {
            type: 'object',
            properties: { id: { type: 'string' }, label: { type: 'string' } },
          },
        },
      },
    },
  })
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
  @ApiAuth()
  @ApiOperation({
    summary:
      "List the current identity's own properties, optionally filtered by status",
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'ListingStatus enum value',
  })
  @ApiResponse({ status: 200, type: [MyActivityPropertyDto] })
  @ApiCommonErrors()
  async getMyActivity(
    @CurrentUser() reqUser: RequestUser,
    @Query('status') status?: ListingStatus,
  ) {
    return this.propertiesService.getMyActivity(reqUser.identityId, status);
  }

  // Public Paginated Endpoint
  @UseGuards(OptionalJwtGuard)
  @Get()
  @ApiOperation({ summary: 'List active properties, paginated and filterable' })
  @ApiQuery({ type: GetPropertiesFilterDto })
  @ApiResponse({ status: 200, type: PropertyListResponseDto })
  @ApiCommonErrors()
  async findAll(
    @Query() filters: GetPropertiesFilterDto,
    @CurrentUser() reqUser?: RequestUser,
  ) {
    return this.propertiesService.findAll(filters, reqUser?.userId);
  }

  // Public Single Property Endpoint
  @UseGuards(OptionalJwtGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a single property by ID' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: 200, type: PropertyDto })
  @ApiCommonErrors()
  async findOne(@Param('id') id: string, @CurrentUser() reqUser?: RequestUser) {
    return this.propertiesService.findOne(id, reqUser?.userId);
  }

  // Public View Tracking Endpoint
  @Patch(':id/view')
  @ApiOperation({ summary: 'Increment the view counter for a property' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: 200, type: IncrementViewsResponseDto })
  @ApiCommonErrors()
  async incrementViews(@Param('id') id: string) {
    return this.propertiesService.incrementViews(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiAuth()
  @ApiOperation({
    summary:
      'Create a new property listing for the current identity, with up to 10 images',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, type: PropertyDto })
  @ApiCommonErrors()
  async create(
    @CurrentUser() reqUser: RequestUser,
    @Body() createPropertyDto: CreatePropertyDto,
  ) {
    return this.propertiesService.create(reqUser.identityId, createPropertyDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiAuth()
  @ApiOperation({ summary: "Update one of the current identity's properties" })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: 200, type: PropertyDto })
  @ApiCommonErrors()
  async update(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(reqUser.identityId, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiAuth()
  @ApiOperation({
    summary:
      "Delete one of the current identity's properties, with an optional reason",
  })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      properties: { reason: { type: 'string' } },
    },
  })
  @ApiResponse({ status: 200, type: RemovePropertyResponseDto })
  @ApiCommonErrors()
  async remove(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto?: { reason?: string },
  ) {
    return this.propertiesService.remove(reqUser.identityId, id, dto?.reason);
  }

  @Post(':id/archive')
  @UseGuards(AuthGuard('jwt'))
  @ApiAuth()
  @ApiOperation({ summary: 'Archive a property (set status to EXPIRED)' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: 200, description: 'Property archived successfully' })
  @ApiCommonErrors()
  async archive(@CurrentUser() reqUser: RequestUser, @Param('id') id: string) {
    return this.propertiesService.archive(reqUser.identityId, id);
  }

  @Post(':id/renew')
  @UseGuards(AuthGuard('jwt'))
  @ApiAuth()
  @ApiOperation({
    summary:
      'Republish one of your archived (expired/closed) ads, spending one credit',
  })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiBody({ type: RenewPropertyDto, required: false })
  @ApiResponse({ status: 201, description: 'Property republished' })
  @ApiResponse({ status: 400, description: 'The ad is not archived' })
  @ApiResponse({
    status: 403,
    description: 'No credit left, or the chosen slot is not usable',
  })
  @ApiResponse({ status: 409, description: 'The ad was already republished' })
  @ApiCommonErrors()
  async renew(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: RenewPropertyDto,
  ) {
    return this.propertiesService.renew(
      reqUser.identityId,
      id,
      dto?.planSlotId,
    );
  }
}
