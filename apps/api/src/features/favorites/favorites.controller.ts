import { Controller, Post, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FavoritesService } from './favorites.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':propertyId')
  async toggle(
    @CurrentUser() user: User,
    @Param('propertyId') propertyId: string,
  ) {
    return this.favoritesService.toggleFavorite(user.id, propertyId);
  }

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.favoritesService.getFavorites(user.id, pageNum, limitNum);
  }

  @Get('ids')
  async getIds(@CurrentUser() user: User) {
    return this.favoritesService.getFavoriteIds(user.id);
  }

  @Get('check/:propertyId')
  async check(
    @CurrentUser() user: User,
    @Param('propertyId') propertyId: string,
  ) {
    return this.favoritesService.checkFavorite(user.id, propertyId);
  }
}
