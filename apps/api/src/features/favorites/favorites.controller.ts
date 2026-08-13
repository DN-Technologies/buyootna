import { Controller, Post, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
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
  constructor(private readonly favoritesService: FavoritesService) {}

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
