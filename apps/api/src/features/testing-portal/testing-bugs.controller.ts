import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
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
import type { Request } from 'express';
import type { TestingUser } from './testing-portal.constants';
import { CurrentTester, TestingAuthGuard } from './testing-auth.guard';
import { TestingBugsService } from './testing-bugs.service';
import {
  TestingBugCommentDto,
  TestingBugQueryDto,
  TestingCreateBugDto,
  TestingUpdateBugDto,
} from './dto/testing-bugs.dto';

/** الأخطاء: bugs reported from the testers' phones. */
@ApiTags('Testing Portal')
@ApiBearerAuth()
@UseGuards(TestingAuthGuard)
@Controller('testing-portal/bugs')
export class TestingBugsController {
  constructor(private readonly bugs: TestingBugsService) {}

  @Get()
  @ApiOperation({
    summary: 'Bug reports, newest first, with counts per status',
  })
  list(@Query() query: TestingBugQueryDto) {
    return this.bugs.list(query);
  }

  @Post('attachments')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 8 * 1024 * 1024 } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a screenshot (image, 8 MB max); returns its URL',
  })
  upload(@UploadedFile() file?: Express.Multer.File) {
    return this.bugs.uploadScreenshot(file);
  }

  @Post()
  @ApiOperation({
    summary: 'Report a bug (the reporter is the signed-in tester)',
  })
  create(
    @Body() dto: TestingCreateBugDto,
    @CurrentTester() tester: TestingUser,
    @Req() req: Request,
  ) {
    return this.bugs.create(dto, { tester, ip: req.ip });
  }

  @Get(':id')
  @ApiOperation({ summary: 'One bug report with its comments' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.bugs.get(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Change a bug's status or severity" })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TestingUpdateBugDto,
    @CurrentTester() tester: TestingUser,
    @Req() req: Request,
  ) {
    return this.bugs.update(id, dto, { tester, ip: req.ip });
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Comment on a bug report' })
  comment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TestingBugCommentDto,
    @CurrentTester() tester: TestingUser,
    @Req() req: Request,
  ) {
    return this.bugs.comment(id, dto, { tester, ip: req.ip });
  }
}
