import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { logBuffer } from '../../core/observability/log-buffer';
import { OtpFeedService } from '../../core/otp-feed/otp-feed.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { TestingUser } from './testing-portal.constants';
import { CurrentTester, TestingAuthGuard } from './testing-auth.guard';
import { TestingAuditService } from './testing-audit.service';
import { TestingHealthService } from './testing-health.service';
import { TestingMetricsService } from './testing-metrics.service';
import { TestingPortalService } from './testing-portal.service';
import { TestingLoginDto } from './dto/testing-login.dto';
import {
  TestingLogsQueryDto,
  TestingMetricsQueryDto,
  TestingOtpQueryDto,
  TestingPageQueryDto,
} from './dto/testing-queries.dto';

@ApiTags('Testing Portal')
@Controller('testing-portal')
export class TestingPortalController {
  constructor(
    private readonly portal: TestingPortalService,
    private readonly health: TestingHealthService,
    private readonly metrics: TestingMetricsService,
    private readonly audit: TestingAuditService,
    private readonly prisma: PrismaService,
    private readonly otpFeed: OtpFeedService,
  ) {}

  @Post('auth/login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Sign in to the testing portal (password + your name)',
  })
  login(@Body() dto: TestingLoginDto, @Req() req: Request) {
    return this.portal.login(dto.password, dto.name, req.ip);
  }

  @Get('auth/me')
  @UseGuards(TestingAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'The signed-in tester' })
  me(@CurrentTester() user: TestingUser) {
    return user;
  }

  @Get('health')
  @UseGuards(TestingAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Health of the database, migrations, S3, email, SMS, the API process and the web apps',
  })
  getHealth() {
    return this.health.check();
  }

  @Get('metrics')
  @UseGuards(TestingAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'API traffic (requests, errors, latency by minute and route) and platform activity',
  })
  getMetrics(@Query() { minutes }: TestingMetricsQueryDto) {
    return this.metrics.snapshot(minutes);
  }

  @Get('logs')
  @UseGuards(TestingAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "The API's newest log lines (in memory), filtered" })
  getLogs(@Query() query: TestingLogsQueryDto) {
    return { data: logBuffer.query(query), contexts: logBuffer.contexts() };
  }

  @Get('versions')
  @UseGuards(TestingAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'The API build, app builds in use, and install links',
  })
  async getVersions() {
    const apps = await this.prisma.appVersionSeen.findMany({
      orderBy: { lastSeenAt: 'desc' },
      take: 50,
    });
    return {
      api: this.health.version(),
      apps,
      installLinks: {
        ios: process.env.TESTFLIGHT_URL || null,
        android: process.env.ANDROID_BUILD_URL || null,
      },
    };
  }

  @Get('otps')
  @UseGuards(TestingAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'The OTPs sent in the last 30 minutes (recipient, purpose, status) — never the codes',
  })
  listOtps(@Query() { q }: TestingOtpQueryDto) {
    return { data: this.otpFeed.list({ q }) };
  }

  @Post('otps/:id/reveal')
  @HttpCode(200)
  @UseGuards(TestingAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "One OTP's code while it's still valid; every reveal is written to the audit log",
  })
  async revealOtp(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTester() tester: TestingUser,
    @Req() req: Request,
  ) {
    const { code, entry } = this.otpFeed.reveal(id);
    if (!entry) throw new NotFoundException('الرمز غير موجود');
    await this.audit.record({
      actorName: tester.name,
      action: 'OTP_REVEALED',
      target: entry.recipient,
      metadata: {
        purpose: entry.purpose,
        channel: entry.channel,
        shown: code !== null,
      },
      ip: req.ip,
    });
    return { code, entry };
  }

  @Get('audit')
  @UseGuards(TestingAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Who did what on the testing portal' })
  getAudit(@Query() { page, limit }: TestingPageQueryDto) {
    return this.audit.list(page, limit);
  }
}
