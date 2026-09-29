import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DocsRole } from '@prisma/client';
import type { DocsUser } from './docs-portal.constants';
import { CurrentDocsUser, DocsAuthGuard, DocsRoles } from './docs-auth.guard';
import { DocsTrackingService } from './docs-tracking.service';
import {
  CreateCommentDto,
  CreateReleaseDto,
  RecordResultDto,
  UpdateReleaseDto,
} from './dto/tracking.dto';

const TEAM = [DocsRole.QA, DocsRole.DEVELOPER, DocsRole.UIUX, DocsRole.ADMIN];

@ApiTags('Docs Portal')
@ApiBearerAuth()
@UseGuards(DocsAuthGuard)
@Controller('qa-portal')
export class DocsTrackingController {
  constructor(private readonly tracking: DocsTrackingService) {}

  @Get('releases')
  @ApiOperation({ summary: 'Test releases, open ones first' })
  listReleases() {
    return this.tracking.listReleases();
  }

  @Post('releases')
  @DocsRoles(DocsRole.ADMIN)
  @ApiOperation({ summary: 'Start a test release' })
  createRelease(
    @Body() dto: CreateReleaseDto,
    @CurrentDocsUser() user: DocsUser,
  ) {
    return this.tracking.createRelease(dto, user);
  }

  @Patch('releases/:id')
  @DocsRoles(DocsRole.ADMIN)
  @ApiOperation({ summary: 'Rename, add notes to, close or reopen a release' })
  updateRelease(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReleaseDto,
  ) {
    return this.tracking.updateRelease(id, dto);
  }

  @Get('releases/:id/summary')
  @ApiOperation({ summary: 'Counts per status for a release (progress)' })
  summary(@Param('id', ParseUUIDPipe) id: string) {
    return this.tracking.summary(id);
  }

  @Get('releases/:id/results')
  @ApiOperation({ summary: "Every story's current result in a release" })
  latestResults(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentDocsUser() user: DocsUser,
  ) {
    return this.tracking.latestResults(id, user);
  }

  @Get('releases/:id/stories/:storyId')
  @DocsRoles(...TEAM)
  @ApiOperation({ summary: "A story's result history and comments" })
  storyHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('storyId') storyId: string,
  ) {
    return this.tracking.storyHistory(id, storyId);
  }

  @Post('releases/:id/stories/:storyId/results')
  @DocsRoles(DocsRole.QA, DocsRole.DEVELOPER, DocsRole.ADMIN)
  @ApiOperation({
    summary:
      'Record a result (QA: pass/fail/blocked/not run; developer: ready to retest)',
  })
  recordResult(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('storyId') storyId: string,
    @Body() dto: RecordResultDto,
    @CurrentDocsUser() user: DocsUser,
  ) {
    return this.tracking.recordResult(id, storyId, dto, user);
  }

  @Post('stories/:storyId/comments')
  @DocsRoles(...TEAM)
  @ApiOperation({
    summary: 'Comment on a story (UI/UX: design mismatch notes)',
  })
  addComment(
    @Param('storyId') storyId: string,
    @Body() dto: CreateCommentDto,
    @CurrentDocsUser() user: DocsUser,
  ) {
    return this.tracking.addComment(storyId, dto, user);
  }

  @Post('attachments')
  @DocsRoles(...TEAM)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a screenshot (image, 5 MB max)' })
  uploadAttachment(@UploadedFile() file?: Express.Multer.File) {
    return this.tracking.uploadAttachment(file);
  }
}
