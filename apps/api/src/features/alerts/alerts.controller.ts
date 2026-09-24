import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import {
  AlertResponseDto,
  AlertsBulkUpdateResponseDto,
} from './dto/alert-response.dto';
import { UpdateAlertActiveDto } from './dto/update-alert-active.dto';
import { PropertyCardDto } from '../properties/dto/property-response.dto';
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

  // Declared before ':id' so "active" isn't captured as an alert id
  @Patch('active')
  @ApiOperation({
    summary: "Pause or resume all of the current identity's alerts",
  })
  @ApiResponse({ status: 200, type: AlertsBulkUpdateResponseDto })
  @ApiCommonErrors()
  async setAllActive(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: UpdateAlertActiveDto,
  ) {
    return this.alertsService.setAllActive(reqUser.identityId, dto.isActive);
  }

  @Patch(':id')
  @ApiOperation({
    summary: "Pause or resume one of the current identity's alerts",
  })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, type: AlertResponseDto })
  @ApiCommonErrors()
  async setActive(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateAlertActiveDto,
  ) {
    return this.alertsService.setActive(reqUser.identityId, id, dto.isActive);
  }

  @Get(':id/matches')
  @ApiOperation({
    summary:
      "List live listings that match one of the current identity's alerts",
  })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, type: [PropertyCardDto] })
  @ApiCommonErrors()
  async findMatches(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
  ) {
    return this.alertsService.findMatches(reqUser.identityId, id);
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
