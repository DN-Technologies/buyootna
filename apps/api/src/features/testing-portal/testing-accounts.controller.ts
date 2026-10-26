import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { DemoCommand } from '../../core/demo-data/pulse-demo';
import type { TestingUser } from './testing-portal.constants';
import { CurrentTester, TestingAuthGuard } from './testing-auth.guard';
import { TestingAccountsService } from './testing-accounts.service';
import {
  TestingCooldownsQueryDto,
  TestingCreateAccountDto,
  TestingDemoDto,
  TestingEditSlotDto,
  TestingFreeAdsDto,
  TestingGrantPlanDto,
  TestingSearchQueryDto,
  TestingUnlockDto,
} from './dto/testing-accounts.dto';

/** الأدوات: accounts, OTP cooldowns, plans and demo data on the testing portal. */
@ApiTags('Testing Portal')
@ApiBearerAuth()
@UseGuards(TestingAuthGuard)
@Controller('testing-portal')
export class TestingAccountsController {
  constructor(private readonly accounts: TestingAccountsService) {}

  @Get('accounts')
  @ApiOperation({
    summary:
      'Find accounts by email, phone or name (incl. company/office names)',
  })
  search(@Query() { q }: TestingSearchQueryDto) {
    return this.accounts.search(q);
  }

  @Post('accounts')
  @ApiOperation({
    summary:
      'Add a test account (individual, optionally with a company or office)',
  })
  create(
    @Body() dto: TestingCreateAccountDto,
    @CurrentTester() tester: TestingUser,
    @Req() req: Request,
  ) {
    return this.accounts.createAccount(dto, { tester, ip: req.ip });
  }

  @Get('accounts/:userId')
  @ApiOperation({
    summary:
      "An account's identities, ad credits per identity, sessions and OTP cooldowns",
  })
  account(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.accounts.account(userId);
  }

  @Post('accounts/:userId/demo')
  @HttpCode(200)
  @ApiOperation({ summary: 'Run a «النبض» demo command for the account' })
  demo(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: TestingDemoDto,
    @CurrentTester() tester: TestingUser,
    @Req() req: Request,
  ) {
    return this.accounts.runDemo(userId, dto.command as DemoCommand, dto.days, {
      tester,
      ip: req.ip,
    });
  }

  @Get('cooldowns')
  @ApiOperation({
    summary:
      "The OTP rate limiter's live entries (cooldowns, daily caps, blocks)",
  })
  cooldowns(@Query() { q }: TestingCooldownsQueryDto) {
    return this.accounts.cooldowns(q ?? '');
  }

  @Post('cooldowns/unlock')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Clear one OTP rate-limit entry (cooldown, daily cap, block)',
  })
  unlock(
    @Body() { key }: TestingUnlockDto,
    @CurrentTester() tester: TestingUser,
    @Req() req: Request,
  ) {
    return this.accounts.unlock(key, { tester, ip: req.ip });
  }

  @Get('plans')
  @ApiOperation({ summary: 'The active ad plans, to grant one' })
  plans() {
    return this.accounts.listPlans();
  }

  @Post('identities/:identityId/plans')
  @ApiOperation({ summary: 'Give a persona a plan (a new active slot)' })
  grantPlan(
    @Param('identityId', ParseUUIDPipe) identityId: string,
    @Body() dto: TestingGrantPlanDto,
    @CurrentTester() tester: TestingUser,
    @Req() req: Request,
  ) {
    return this.accounts.grantPlan(identityId, dto.planId, dto.adsRemaining, {
      tester,
      ip: req.ip,
    });
  }

  @Patch('slots/:slotId')
  @ApiOperation({ summary: "Edit a plan slot's ads left or status" })
  editSlot(
    @Param('slotId', ParseUUIDPipe) slotId: string,
    @Body() dto: TestingEditSlotDto,
    @CurrentTester() tester: TestingUser,
    @Req() req: Request,
  ) {
    return this.accounts.editSlot(slotId, dto, { tester, ip: req.ip });
  }

  @Put('identities/:identityId/free-ads')
  @ApiOperation({ summary: "Set a persona's free ads left" })
  setFreeAds(
    @Param('identityId', ParseUUIDPipe) identityId: string,
    @Body() { freeAdsRemaining }: TestingFreeAdsDto,
    @CurrentTester() tester: TestingUser,
    @Req() req: Request,
  ) {
    return this.accounts.setFreeAds(identityId, freeAdsRemaining, {
      tester,
      ip: req.ip,
    });
  }
}
