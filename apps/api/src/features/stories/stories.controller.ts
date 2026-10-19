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
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { CreateStoryUploadDto } from './dto/create-story-upload.dto';
import { PublishStoryDto } from './dto/publish-story.dto';
import { StoryFeedQueryDto } from './dto/story-feed-query.dto';
import {
  AuthorStoryDto,
  MyStoriesDto,
  StoryAuthorStoriesDto,
  StoryFeedDto,
  StoryUploadSlotDto,
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
  ) {}

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
    return this.stories.findByAuthor(reqUser.identityId, identityId);
  }
}
