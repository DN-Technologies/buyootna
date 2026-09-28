import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { ProviderFavoritesService } from './provider-favorites.service';

@Module({
  imports: [UsersModule],
  controllers: [FavoritesController],
  providers: [FavoritesService, ProviderFavoritesService],
})
export class FavoritesModule {}
