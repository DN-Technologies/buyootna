import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvoicesService } from './invoices.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('invoices')
@UseGuards(AuthGuard('jwt'))
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async getInvoices(@CurrentUser() user: User) {
    return this.invoicesService.findUserInvoices(user.id);
  }
}
