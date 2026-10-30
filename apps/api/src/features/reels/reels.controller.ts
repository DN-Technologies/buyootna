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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { OptionalJwtGuard } from '../../core/guards/optional-jwt.guard';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { CreateReportDto } from '../reports/dto/create-report.dto';
import { ReportsService } from '../reports/reports.service';
import { CreateReelUploadDto } from './dto/create-reel-upload.dto';
import { PublishReelDto } from './dto/publish-reel.dto';
import { RecordReelViewsDto } from './dto/record-reel-views.dto';
import { RecordReelWatchesDto } from './dto/record-reel-watches.dto';
import { ReelFeedQueryDto } from './dto/reel-feed-query.dto';
import { ReelListQueryDto } from './dto/reel-list-query.dto';
import {
  AuthorReelDto,
  MyReelsDto,
  ReelAvailabilityDto,
  ReelFeedDto,
  ReelLikeDto,
  ReelUploadSlotDto,
  ViewerReelDto,
} from './dto/reel-response.dto';
import { ReelsEnabledGuard } from './reels-enabled.guard';
import { ReelsEngagementService } from './reels-engagement.service';
import { ReelsFeedService, type ReelViewer } from './reels-feed.service';
import { ReelsMediaService } from './reels-media.service';
import { reelsEnabledFor } from './reels.switch';
import { ReelsService } from './reels.service';

const viewerOf = (reqUser?: RequestUser): ReelViewer | null =>
  reqUser ? { identityId: reqUser.identityId, userId: reqUser.userId } : null;

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
  constructor(
    private readonly reels: ReelsService,
    private readonly feedService: ReelsFeedService,
    private readonly engagement: ReelsEngagementService,
    private readonly media: ReelsMediaService,
    private readonly reports: ReportsService,
  ) {}

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

  // The fixed paths below are declared before ':id', so they aren't taken for
  // a reel id
  @Post('views')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Record that the current profile watched these reels (up to 50; repeat-safe; reels it may not view are skipped)',
  })
  @ApiResponse({ status: 204 })
  @ApiCommonErrors()
  async recordViews(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: RecordReelViewsDto,
  ): Promise<void> {
    await this.engagement.recordViews(viewerOf(reqUser)!, dto);
  }

  @Post('watches')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Record how much of each reel the current profile watched (up to 50; keeps the highest; for ranking)',
  })
  @ApiResponse({ status: 204 })
  @ApiCommonErrors()
  async recordWatches(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: RecordReelWatchesDto,
  ): Promise<void> {
    await this.engagement.recordWatches(viewerOf(reqUser)!, dto);
  }

  @Get('feed')
  @ApiOperation({
    summary:
      'Main feed, for guests too. Signed in: unseen newest first, then seen newest first. Guests: newest first. Filters narrow it by the reel listing, leaving out reels with none.',
  })
  @ApiResponse({ status: 200, type: ReelFeedDto })
  @ApiCommonErrors()
  feed(@Query() query: ReelFeedQueryDto, @CurrentUser() reqUser?: RequestUser) {
    return this.feedService.feed(viewerOf(reqUser), query);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: "The current profile's published reels, with their counts",
  })
  @ApiResponse({ status: 200, type: MyReelsDto })
  @ApiCommonErrors()
  mine(@CurrentUser() reqUser: RequestUser, @Query() query: ReelListQueryDto) {
    return this.feedService.mine(reqUser.identityId, query);
  }

  @Get('authors/:identityId')
  @ApiOperation({
    summary: "A company's or office's reels as shown on its profile",
  })
  @ApiResponse({ status: 200, type: ReelFeedDto })
  @ApiCommonErrors()
  byAuthor(
    @Param('identityId', ParseUUIDPipe) identityId: string,
    @Query() query: ReelListQueryDto,
    @CurrentUser() reqUser?: RequestUser,
  ) {
    return this.feedService.byAuthor(viewerOf(reqUser), identityId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One reel, for shares and links' })
  @ApiResponse({ status: 200, type: ViewerReelDto })
  @ApiCommonErrors()
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() reqUser?: RequestUser,
  ) {
    return this.feedService.findOne(viewerOf(reqUser), id);
  }

  @Post(':id/reports')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary:
      'Report a reel: a report against its author, linked to the reel (one per profile and reel; repeating returns the first)',
  })
  @ApiCommonErrors()
  report(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reports.createForReel(
      { userId: reqUser.userId, identityId: reqUser.identityId },
      id,
      dto,
      (reel) => this.media.linksFor(reel),
    );
  }

  @Put(':id/like')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Like a reel (repeat-safe)' })
  @ApiResponse({ status: 200, type: ReelLikeDto })
  @ApiCommonErrors()
  like(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.engagement.like(viewerOf(reqUser)!, id);
  }

  @Delete(':id/like')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Take back a like (repeat-safe)' })
  @ApiResponse({ status: 200, type: ReelLikeDto })
  @ApiCommonErrors()
  unlike(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.engagement.unlike(viewerOf(reqUser)!, id);
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
