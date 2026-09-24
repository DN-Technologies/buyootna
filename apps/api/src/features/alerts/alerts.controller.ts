import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { AlertResponseDto } from './dto/alert-response.dto';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';

@ApiTags('Alerts')
@ApiAuth()
@Controller('alerts')
@UseGuards(AuthGuard('jwt'))
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new saved alert for the current identity',
  })
  @ApiResponse({ status: 201, type: AlertResponseDto })
  @ApiCommonErrors()
  async create(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateAlertDto,
  ) {
    return this.alertsService.create(reqUser.identityId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: "List the current identity's saved alerts" })
  @ApiResponse({ status: 200, type: [AlertResponseDto] })
  @ApiCommonErrors()
  async findMine(@CurrentUser() reqUser: RequestUser) {
    return this.alertsService.findMine(reqUser.identityId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: "Delete one of the current identity's saved alerts",
  })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiCommonErrors()
  async remove(@CurrentUser() reqUser: RequestUser, @Param('id') id: string) {
    return this.alertsService.remove(reqUser.identityId, id);
  }
}
