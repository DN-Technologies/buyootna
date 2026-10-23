import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetMapBoundsDto } from './dto/get-map-bounds.dto';
import { MapService } from './map.service';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import { MapDiscoverResponseDto } from './dto/map-discover-response.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { OptionalJwtGuard } from '../../core/guards/optional-jwt.guard';
import type { RequestUser } from '../auth/strategies/jwt.strategy';

@ApiTags('Map')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  // Signed in, accounts blocked either way are left off the map
  @UseGuards(OptionalJwtGuard)
  @Get('discover')
  @ApiOperation({
    summary:
      'Discover properties or companies as map pins within a bounding box, as GeoJSON',
  })
  @ApiQuery({ type: GetMapBoundsDto })
  @ApiResponse({ status: 200, type: MapDiscoverResponseDto })
  @ApiCommonErrors()
  discover(
    @Query() dto: GetMapBoundsDto,
    @CurrentUser() reqUser?: RequestUser,
  ) {
    return this.mapService.discover(dto, reqUser?.userId);
  }
}
