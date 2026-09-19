import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { CompanyRequestsService } from './company-requests.service';
import type {
  RequestScopeFilter,
  RequestStatusFilter,
} from './company-requests.service';
import { CompanyRequestResponseDto } from './dto/company-request-response.dto';

@ApiTags('Company Requests')
@ApiAuth()
@Controller('company-requests')
@UseGuards(AuthGuard('jwt'))
export class CompanyRequestsController {
  constructor(private readonly companyRequestsService: CompanyRequestsService) {}

  @Get('me')
  @ApiOperation({
    summary:
      "List service requests (leads) visible to the current company identity",
  })
  @ApiQuery({ name: 'scope', enum: ['company', 'public'], required: false })
  @ApiQuery({
    name: 'status',
    enum: ['all', 'pending', 'accepted', 'responded', 'rejected'],
    required: false,
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, type: [CompanyRequestResponseDto] })
  @ApiCommonErrors()
  async findMine(
    @CurrentUser() reqUser: RequestUser,
    @Query('scope') scope: RequestScopeFilter = 'company',
    @Query('status') status?: RequestStatusFilter,
    @Query('search') search?: string,
  ) {
    return this.companyRequestsService.findMine(reqUser.identityId, {
      scope,
      status,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single request visible to this company' })
  @ApiResponse({ status: 200, type: CompanyRequestResponseDto })
  @ApiCommonErrors()
  async findOne(@CurrentUser() reqUser: RequestUser, @Param('id') id: string) {
    return this.companyRequestsService.findOne(id, reqUser.identityId);
  }

  @Patch(':id/accept')
  @ApiOperation({
    summary:
      'Accept a request -- exclusively claims a public/marketplace request',
  })
  @ApiResponse({ status: 200, type: CompanyRequestResponseDto })
  @ApiResponse({ status: 409, description: 'Already claimed by another company' })
  @ApiCommonErrors()
  async accept(@CurrentUser() reqUser: RequestUser, @Param('id') id: string) {
    return this.companyRequestsService.accept(id, reqUser.identityId);
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Reject a request sent directly to this company',
  })
  @ApiResponse({ status: 200, type: CompanyRequestResponseDto })
  @ApiCommonErrors()
  async reject(@CurrentUser() reqUser: RequestUser, @Param('id') id: string) {
    return this.companyRequestsService.reject(id, reqUser.identityId);
  }

  @Patch(':id/mark-responded')
  @ApiOperation({
    summary: 'Mark a request as responded to (after opening a chat with the client)',
  })
  @ApiResponse({ status: 200, type: CompanyRequestResponseDto })
  @ApiCommonErrors()
  async markResponded(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
  ) {
    return this.companyRequestsService.markResponded(id, reqUser.identityId);
  }
}
