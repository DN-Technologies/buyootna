import { Controller, Post, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FavoritesService } from './favorites.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';

@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':propertyId')
  async toggle(
    @CurrentUser() reqUser: RequestUser,
    @Param('propertyId') propertyId: string,
  ) {
    return this.favoritesService.toggleFavorite(reqUser.identityId, propertyId);
  }

  @Get()
  async findAll(
    @CurrentUser() reqUser: RequestUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.favoritesService.getFavorites(reqUser.identityId, pageNum, limitNum);
  }

  @Get('ids')
  async getIds(@CurrentUser() reqUser: RequestUser) {
    return this.favoritesService.getFavoriteIds(reqUser.identityId);
  }

  @Get('check/:propertyId')
  async check(
    @CurrentUser() reqUser: RequestUser,
    @Param('propertyId') propertyId: string,
  ) {
    return this.favoritesService.checkFavorite(reqUser.identityId, propertyId);
  }
}
