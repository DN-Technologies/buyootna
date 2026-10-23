import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import {
  ProviderFavoritesService,
  type ProviderType,
} from './provider-favorites.service';
import {
  FavoriteTabQueryDto,
  RestoreFavoritesDto,
} from './dto/favorites-bulk.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import {
  CheckFavoriteResponseDto,
  FavoriteIdsResponseDto,
  FavoritesListResponseDto,
  ToggleFavoriteResponseDto,
} from './dto/favorite-response.dto';

@ApiTags('Favorites')
@ApiAuth()
@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly providerFavorites: ProviderFavoritesService,
  ) {}

  // --- Companies & offices (declared before POST /:propertyId so its
  // one-segment param can't swallow these paths) ---

  @Post('restore')
  @ApiOperation({
    summary: 'Put back favorites removed by "clear all" (undo)',
  })
  @ApiCommonErrors()
  restore(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: RestoreFavoritesDto,
  ) {
    return dto.type === 'properties'
      ? this.favoritesService.restoreProperties(reqUser.identityId, dto.ids)
      : this.providerFavorites.restore(reqUser.identityId, dto.type, dto.ids);
  }

  @Delete('all')
  @ApiOperation({
    summary:
      'Clear one favorites tab (properties, COMPANY or OFFICE); returns the removed ids for undo',
  })
  @ApiCommonErrors()
  clearAll(
    @CurrentUser() reqUser: RequestUser,
    @Query() query: FavoriteTabQueryDto,
  ) {
    return query.type === 'properties'
      ? this.favoritesService.clearProperties(reqUser.identityId)
      : this.providerFavorites.clear(reqUser.identityId, query.type);
  }

  @Get('providers/ids')
  @ApiOperation({ summary: 'Ids of every company/office the identity saved' })
  @ApiCommonErrors()
  providerIds(@CurrentUser() reqUser: RequestUser) {
    return this.providerFavorites.getIds(reqUser.identityId);
  }

  @Get('providers')
  @ApiOperation({
    summary: 'Saved companies or offices, newest first, as directory cards',
  })
  @ApiQuery({ name: 'type', enum: ['COMPANY', 'OFFICE'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiCommonErrors()
  listProviders(
    @CurrentUser() reqUser: RequestUser,
    @Query('type', new ParseEnumPipe(['COMPANY', 'OFFICE'])) type: ProviderType,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.providerFavorites.list(
      reqUser.identityId,
      type,
      Math.max(1, page),
      Math.min(Math.max(1, limit), 50),
    );
  }

  @Post('providers/:providerId')
  @ApiOperation({ summary: 'Save or unsave a company/office' })
  @ApiParam({ name: 'providerId', description: 'Company/office identity id' })
  @ApiCommonErrors()
  toggleProvider(
    @CurrentUser() reqUser: RequestUser,
    @Param('providerId') providerId: string,
  ) {
    return this.providerFavorites.toggle(reqUser.identityId, providerId);
  }

  // --- Properties ---

  @Post(':propertyId')
  @ApiOperation({
    summary:
      'Toggle a property as favorited/unfavorited for the current identity',
  })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiResponse({ status: 201, type: ToggleFavoriteResponseDto })
  @ApiCommonErrors()
  async toggle(
    @CurrentUser() reqUser: RequestUser,
    @Param('propertyId') propertyId: string,
  ) {
    return this.favoritesService.toggleFavorite(reqUser.identityId, propertyId);
  }

  @Get()
  @ApiOperation({
    summary: "List the current identity's favorited properties, paginated",
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, type: FavoritesListResponseDto })
  @ApiCommonErrors()
  async findAll(
    @CurrentUser() reqUser: RequestUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.favoritesService.getFavorites(
      reqUser.identityId,
      pageNum,
      limitNum,
      reqUser.userId,
    );
  }

  @Get('ids')
  @ApiOperation({
    summary: 'Get all favorited property IDs for the current identity',
  })
  @ApiResponse({ status: 200, type: FavoriteIdsResponseDto })
  @ApiCommonErrors()
  async getIds(@CurrentUser() reqUser: RequestUser) {
    return this.favoritesService.getFavoriteIds(reqUser.identityId);
  }

  @Get('check/:propertyId')
  @ApiOperation({
    summary:
      'Check whether a single property is favorited by the current identity',
  })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiResponse({ status: 200, type: CheckFavoriteResponseDto })
  @ApiCommonErrors()
  async check(
    @CurrentUser() reqUser: RequestUser,
    @Param('propertyId') propertyId: string,
  ) {
    return this.favoritesService.checkFavorite(reqUser.identityId, propertyId);
  }
}
