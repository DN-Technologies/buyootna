import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import { InvoiceDto } from './dto/invoice-response.dto';

@ApiTags('Invoices')
@ApiAuth()
@Controller('invoices')
@UseGuards(AuthGuard('jwt'))
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: "List the current user's invoices" })
  @ApiResponse({ status: 200, type: [InvoiceDto] })
  @ApiCommonErrors()
  async getInvoices(@CurrentUser() reqUser: RequestUser) {
    return this.invoicesService.findUserInvoices(reqUser.userId);
  }
}
