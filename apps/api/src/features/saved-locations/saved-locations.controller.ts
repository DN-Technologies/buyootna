import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import {
  CreateSavedLocationDto,
  UpdateSavedLocationDto,
} from './dto/saved-location.dto';
import { SavedLocationsService } from './saved-locations.service';

/** The location picker's saved places (المنزل / العمل / custom). */
@ApiTags('Saved locations')
@ApiAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('saved-locations')
export class SavedLocationsController {
  constructor(private readonly savedLocations: SavedLocationsService) {}

  @Get()
  @ApiOperation({ summary: 'The account saved places, HOME and WORK first' })
  @ApiCommonErrors()
  list(@CurrentUser() reqUser: RequestUser) {
    return this.savedLocations.list(reqUser.userId);
  }

  @Post()
  @ApiOperation({
    summary:
      'Save a place; HOME/WORK replace the existing one, OTHER needs a name (max 20 places)',
  })
  @ApiCommonErrors()
  create(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateSavedLocationDto,
  ) {
    return this.savedLocations.create(reqUser.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename, relabel or move a saved place' })
  @ApiCommonErrors()
  update(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSavedLocationDto,
  ) {
    return this.savedLocations.update(reqUser.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a saved place' })
  @ApiCommonErrors()
  remove(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.savedLocations.remove(reqUser.userId, id);
  }
}
