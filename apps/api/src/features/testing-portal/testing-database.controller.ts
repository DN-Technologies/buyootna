import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { TestingUser } from './testing-portal.constants';
import { CurrentTester, TestingAuthGuard } from './testing-auth.guard';
import { TestingDatabaseService } from './testing-database.service';
import { TestingSeedDto, TestingWipeDto } from './dto/testing-database.dto';

/** The database danger zone: wipe (backup first) and seed. */
@ApiTags('Testing Portal')
@ApiBearerAuth()
@UseGuards(TestingAuthGuard)
@Controller('testing-portal/database')
export class TestingDatabaseController {
  constructor(private readonly database: TestingDatabaseService) {}

  @Get()
  @ApiOperation({
    summary: 'Users, tables, rows, and the current or last wipe/seed job',
  })
  overview() {
    return this.database.overview();
  }

  @Post('wipe')
  @HttpCode(202)
  @ApiOperation({
    summary:
      'Back up to S3 (pg_dump), then delete all data; needs the typed phrase and the DANGER password',
  })
  wipe(
    @Body() { confirm, dangerPassword }: TestingWipeDto,
    @CurrentTester() tester: TestingUser,
    @Req() req: Request,
  ) {
    return this.database.wipe(confirm, dangerPassword, { tester, ip: req.ip });
  }

  @Post('seed')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Fill an empty database with the dev fixtures (no admin account)',
  })
  seed(
    @Body() { password }: TestingSeedDto,
    @CurrentTester() tester: TestingUser,
    @Req() req: Request,
  ) {
    return this.database.seed(password, { tester, ip: req.ip });
  }
}
