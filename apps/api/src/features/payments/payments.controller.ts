import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Res,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';
import type { TapChargeResponse } from './payments.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('charge')
  @UseGuards(AuthGuard('jwt'))
  async createCharge(
    @CurrentUser() user: User,
    @Body('planSlug') planSlug: string,
    @Body('appRedirectUrl') appRedirectUrl: string,
    @Body('sourceId') sourceId?: string,
  ) {
    return this.paymentsService.createCharge(
      user.id,
      planSlug,
      appRedirectUrl,
      sourceId,
    );
  }

  @Get('redirect')
  async verifyAndRedirect(
    @Query('tap_id') tapId: string,
    @Query('invoiceId') invoiceId: string,
    @Query('appRedirectUrl') appRedirectUrl: string,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.paymentsService.verifyChargeAndRedirect(
      tapId,
      invoiceId,
      appRedirectUrl,
    );
    return res.redirect(redirectUrl);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() chargeBody: TapChargeResponse) {
    return this.paymentsService.handleWebhook(chargeBody);
  }

  @Get('status/:invoiceId')
  @UseGuards(AuthGuard('jwt'))
  async getInvoiceStatus(
    @CurrentUser() user: User,
    @Param('invoiceId') invoiceId: string,
  ) {
    return this.paymentsService.getInvoiceStatus(user.id, invoiceId);
  }
}
