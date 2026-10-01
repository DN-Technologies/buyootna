import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { ListServiceInvoicesDto } from './dto/list-service-invoices.dto';
import { ClientInvoicesService } from './services/client-invoices.service';

/** فواتير الخدمات: invoices companies addressed to the signed-in persona. */
@ApiTags('Service invoices')
@ApiAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('service-invoices')
export class ServiceInvoicesController {
  constructor(private readonly invoices: ClientInvoicesService) {}

  @Get()
  @ApiOperation({
    summary:
      'Invoices addressed to the current persona, searchable (invoice no., service, company) and sorted by issue date',
  })
  @ApiCommonErrors()
  list(
    @CurrentUser() reqUser: RequestUser,
    @Query() query: ListServiceInvoicesDto,
  ) {
    return this.invoices.list(reqUser.identityId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'One invoice with its items, for the details sheet',
  })
  @ApiCommonErrors()
  get(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.invoices.get(reqUser.identityId, id);
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      "Remove an invoice from the client's own list (the company keeps it)",
  })
  @ApiCommonErrors()
  remove(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.invoices.remove(reqUser.identityId, id);
  }
}
