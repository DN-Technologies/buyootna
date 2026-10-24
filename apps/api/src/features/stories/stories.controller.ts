import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { CreateReportDto } from '../reports/dto/create-report.dto';
import { ReportsService } from '../reports/reports.service';
import { CreateStoryUploadDto } from './dto/create-story-upload.dto';
import { PublishStoryDto } from './dto/publish-story.dto';
import { RecordStoryViewsDto } from './dto/record-story-views.dto';
import { StoryViewersQueryDto } from './dto/story-viewers-query.dto';
import { StoryFeedQueryDto } from './dto/story-feed-query.dto';
import {
  CreateStoryHighlightDto,
  ReorderStoryHighlightsDto,
  StoryArchiveQueryDto,
  UpdateStoryHighlightDto,
} from './dto/story-highlight.dto';
import {
  AuthorStoryDto,
  MyStoriesDto,
  StoryArchiveDto,
  StoryAuthorStoriesDto,
  StoryFeedDto,
  StoryHighlightDto,
  StoryHighlightsDto,
  StoryUploadSlotDto,
  StoryViewersDto,
} from './dto/story-response.dto';
import { StoriesFeedService } from './stories-feed.service';
import { StoriesService } from './stories.service';

@ApiTags('Stories')
@ApiAuth()
@Controller('stories')
@UseGuards(AuthGuard('jwt'))
export class StoriesController {
  constructor(
    private readonly stories: StoriesService,
    private readonly feedService: StoriesFeedService,
    private readonly reports: ReportsService,
  ) {}

  @Post('views')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Record that the current profile viewed these stories (up to 50; repeat-safe; stories it may not view are skipped)',
  })
  @ApiResponse({ status: 204 })
  @ApiCommonErrors()
  async recordViews(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: RecordStoryViewsDto,
  ): Promise<void> {
    await this.stories.recordViews(
      { identityId: reqUser.identityId, userId: reqUser.userId },
      dto,
    );
  }

  @Get(':id/viewers')
  @ApiOperation({
    summary: "Who viewed one of the current profile's stories (author only)",
  })
  @ApiResponse({ status: 200, type: StoryViewersDto })
  @ApiCommonErrors()
  viewers(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: StoryViewersQueryDto,
  ) {
    return this.stories.viewers(id, reqUser.identityId, query);
  }

  @Post(':id/reports')
  @ApiOperation({
    summary:
      'Report a story: a report against its author, linked to the story (one per profile and story; repeating returns the first)',
  })
  @ApiCommonErrors()
  report(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reports.createForStory(
      { userId: reqUser.userId, identityId: reqUser.identityId },
      id,
      dto,
    );
  }

  @Post('uploads')
  @ApiOperation({
    summary:
      'Get an upload slot for a story photo (approved companies with a running subscription, and approved offices). PUT the file to media.url with exactly media.headers, then publish.',
  })
  @ApiResponse({ status: 201, type: StoryUploadSlotDto })
  @ApiCommonErrors()
  createUpload(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateStoryUploadDto,
  ) {
    return this.stories.createUpload(reqUser.identityId, dto);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Publish an uploaded story after the server checks the file (repeat-safe); it shows for 24 hours',
  })
  @ApiResponse({ status: 200, type: AuthorStoryDto })
  @ApiCommonErrors()
  publish(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PublishStoryDto,
  ) {
    return this.stories.publish(id, reqUser.identityId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'The author deletes a story (repeat-safe)' })
  @ApiResponse({ status: 204 })
  @ApiCommonErrors()
  async remove(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.stories.remove(id, reqUser.identityId);
  }

  @Get('feed')
  @ApiOperation({
    summary:
      'Stories feed: unseen first, followed providers first within unseen and within seen; paginated with nextCursor',
  })
  @ApiResponse({ status: 200, type: StoryFeedDto })
  @ApiCommonErrors()
  feed(@CurrentUser() reqUser: RequestUser, @Query() query: StoryFeedQueryDto) {
    return this.feedService.feed(
      { identityId: reqUser.identityId, userId: reqUser.userId },
      query,
    );
  }

  @Get('me')
  @ApiOperation({
    summary: "The current profile's live stories with view counts",
  })
  @ApiResponse({ status: 200, type: MyStoriesDto })
  @ApiCommonErrors()
  mine(@CurrentUser() reqUser: RequestUser) {
    return this.stories.findMine(reqUser.identityId);
  }

  @Get('authors/:identityId')
  @ApiOperation({ summary: "One company's or office's live stories" })
  @ApiResponse({ status: 200, type: StoryAuthorStoriesDto })
  @ApiCommonErrors()
  byAuthor(
    @CurrentUser() reqUser: RequestUser,
    @Param('identityId', ParseUUIDPipe) identityId: string,
  ) {
    return this.stories.findByAuthor(
      { identityId: reqUser.identityId, userId: reqUser.userId },
      identityId,
    );
  }

  @Get('me/archive')
  @ApiOperation({
    summary:
      "The current profile's stories of the last 30 days, live and past, newest first, with view counts (its archive; only it sees the past ones)",
  })
  @ApiResponse({ status: 200, type: StoryArchiveDto })
  @ApiCommonErrors()
  archive(
    @CurrentUser() reqUser: RequestUser,
    @Query() query: StoryArchiveQueryDto,
  ) {
    return this.stories.archive(reqUser.identityId, query.cursor);
  }

  @Get('me/highlights')
  @ApiOperation({
    summary: "The current profile's highlights (المميزة), empty ones too",
  })
  @ApiResponse({ status: 200, type: StoryHighlightsDto })
  @ApiCommonErrors()
  myHighlights(@CurrentUser() reqUser: RequestUser) {
    return this.stories.myHighlights(reqUser.identityId);
  }

  @Get('authors/:identityId/highlights')
  @ApiOperation({
    summary:
      "A company's or office's highlights as shown on its profile (none when it isn't visible to the viewer)",
  })
  @ApiResponse({ status: 200, type: StoryHighlightsDto })
  @ApiCommonErrors()
  authorHighlights(
    @CurrentUser() reqUser: RequestUser,
    @Param('identityId', ParseUUIDPipe) identityId: string,
  ) {
    return this.stories.authorHighlights(reqUser.userId, identityId);
  }

  @Post('highlights')
  @ApiOperation({
    summary:
      "Create a highlight from the author's own stories of the last 30 days; it is added at the end",
  })
  @ApiResponse({ status: 201, type: StoryHighlightDto })
  @ApiCommonErrors()
  createHighlight(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateStoryHighlightDto,
  ) {
    return this.stories.createHighlight(reqUser.identityId, dto);
  }

  // Declared before 'highlights/:id' so "order" isn't taken for an id
  @Put('highlights/order')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Reorder all of the author's highlights" })
  @ApiResponse({ status: 204 })
  @ApiCommonErrors()
  async reorderHighlights(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: ReorderStoryHighlightsDto,
  ): Promise<void> {
    await this.stories.reorderHighlights(reqUser.identityId, dto.ids);
  }

  @Patch('highlights/:id')
  @ApiOperation({
    summary:
      'Rename a highlight, change its cover, or replace its stories and their order',
  })
  @ApiResponse({ status: 200, type: StoryHighlightDto })
  @ApiCommonErrors()
  updateHighlight(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoryHighlightDto,
  ) {
    return this.stories.updateHighlight(reqUser.identityId, id, dto);
  }

  @Delete('highlights/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Delete a highlight (its stories stay in the archive while within its 30 days)',
  })
  @ApiResponse({ status: 204 })
  @ApiCommonErrors()
  async removeHighlight(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.stories.removeHighlight(reqUser.identityId, id);
  }
}
