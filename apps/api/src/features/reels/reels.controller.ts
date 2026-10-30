import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { OptionalJwtGuard } from '../../core/guards/optional-jwt.guard';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { CreateReelUploadDto } from './dto/create-reel-upload.dto';
import { PublishReelDto } from './dto/publish-reel.dto';
import {
  AuthorReelDto,
  ReelAvailabilityDto,
  ReelUploadSlotDto,
} from './dto/reel-response.dto';
import { ReelsEnabledGuard } from './reels-enabled.guard';
import { reelsEnabledFor } from './reels.switch';
import { ReelsService } from './reels.service';

/**
 * The one route that answers whether the switch is on or off. Registered
 * before ReelsController, so `availability` isn't taken for a reel id.
 */
@ApiTags('Reels')
@Controller('reels')
export class ReelsAvailabilityController {
  @Get('availability')
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: 'Whether reels are on for this caller' })
  @ApiResponse({ status: 200, type: ReelAvailabilityDto })
  availability(@CurrentUser() reqUser?: RequestUser): ReelAvailabilityDto {
    return { enabled: reelsEnabledFor(reqUser?.userId) };
  }
}

// To anyone the switch is off for, every route here answers 404. Signing in
// is checked after it, so a route's 401 doesn't give the feature away
@ApiTags('Reels')
@ApiAuth()
@Controller('reels')
@UseGuards(OptionalJwtGuard, ReelsEnabledGuard)
export class ReelsController {
  constructor(private readonly reels: ReelsService) {}

  @Post('uploads')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary:
      'Get an upload slot for a reel (approved companies with a running subscription, and approved offices). PUT the files to media.url and poster.url with exactly their headers, then publish.',
  })
  @ApiResponse({ status: 201, type: ReelUploadSlotDto })
  @ApiCommonErrors()
  createUpload(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateReelUploadDto,
  ) {
    return this.reels.createUpload(reqUser.identityId, dto);
  }

  @Post(':id/publish')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Publish an uploaded reel after the server checks the file (repeat-safe); it shows until deleted',
  })
  @ApiResponse({ status: 200, type: AuthorReelDto })
  @ApiCommonErrors()
  publish(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PublishReelDto,
  ) {
    return this.reels.publish(id, reqUser.identityId, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'The author deletes a reel (repeat-safe)' })
  @ApiResponse({ status: 204 })
  @ApiCommonErrors()
  async remove(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.reels.remove(id, reqUser.identityId);
  }
}
