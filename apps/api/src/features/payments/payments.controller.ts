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
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import type { TapChargeResponse } from './payments.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import {
  CreateChargeResponseDto,
  InvoiceStatusResponseDto,
} from './dto/payment-response.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('charge')
  @UseGuards(AuthGuard('jwt'))
  @ApiAuth()
  @ApiOperation({ summary: 'Create a Tap Payments charge for a plan purchase and get a checkout URL' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['planSlug', 'appRedirectUrl'],
      properties: {
        planSlug: { type: 'string' },
        appRedirectUrl: { type: 'string' },
        sourceId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, type: CreateChargeResponseDto })
  @ApiCommonErrors()
  async createCharge(
    @CurrentUser() reqUser: RequestUser,
    @Body('planSlug') planSlug: string,
    @Body('appRedirectUrl') appRedirectUrl: string,
    @Body('sourceId') sourceId?: string,
  ) {
    return this.paymentsService.createCharge(
      reqUser.userId,
      planSlug,
      appRedirectUrl,
      sourceId,
    );
  }

  @Get('redirect')
  @ApiOperation({ summary: "Verify a Tap Payments charge and redirect to the app's return URL (public, called by Tap's checkout flow)" })
  @ApiQuery({ name: 'tap_id', required: true })
  @ApiQuery({ name: 'invoiceId', required: true })
  @ApiQuery({ name: 'appRedirectUrl', required: true })
  @ApiResponse({ status: 302, description: 'Redirects to appRedirectUrl' })
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
  @ApiOperation({ summary: 'Tap Payments webhook callback (public, called by the Tap payment gateway server-to-server, not by app users)' })
  @ApiResponse({ status: 200, description: 'Acknowledged' })
  async handleWebhook(@Body() chargeBody: TapChargeResponse) {
    return this.paymentsService.handleWebhook(chargeBody);
  }

  @Get('status/:invoiceId')
  @UseGuards(AuthGuard('jwt'))
  @ApiAuth()
  @ApiOperation({ summary: "Get the payment status of one of the current user's invoices" })
  @ApiParam({ name: 'invoiceId', description: 'Invoice ID' })
  @ApiResponse({ status: 200, type: InvoiceStatusResponseDto })
  @ApiCommonErrors()
  async getInvoiceStatus(
    @CurrentUser() reqUser: RequestUser,
    @Param('invoiceId') invoiceId: string,
  ) {
    return this.paymentsService.getInvoiceStatus(reqUser.userId, invoiceId);
  }
}
