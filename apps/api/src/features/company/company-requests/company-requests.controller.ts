import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { ApiAuth } from '../../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../../core/swagger/api-common-errors.decorator';
import type { RequestUser } from '../../auth/strategies/jwt.strategy';
import { CompanyRequestsService } from './company-requests.service';
import type {
  RequestScopeFilter,
  RequestStatusFilter,
} from './company-requests.service';
import { CreateCompanyRequestDto } from './dto/create-company-request.dto';
import { CompanyRequestResponseDto } from './dto/company-request-response.dto';
import { CreateRequestOfferDto } from './dto/create-request-offer.dto';

@ApiTags('Company Requests')
@ApiAuth()
@Controller('company-requests')
@UseGuards(AuthGuard('jwt'))
export class CompanyRequestsController {
  constructor(
    private readonly companyRequestsService: CompanyRequestsService,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Submit a price-quote request as the current identity (directed to a company/office, or public when no target is given)',
  })
  @ApiResponse({ status: 201, type: CompanyRequestResponseDto })
  @ApiCommonErrors()
  async create(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateCompanyRequestDto,
  ) {
    return this.companyRequestsService.create(reqUser.identityId, dto);
  }

  @Get('me')
  @ApiOperation({
    summary:
      'List service requests (leads) visible to the current company identity, or scope=mine for the requests this identity submitted',
  })
  @ApiQuery({
    name: 'scope',
    enum: ['company', 'public', 'mine'],
    required: false,
  })
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

  @Delete('me')
  @ApiOperation({
    summary: 'Delete every request this identity submitted (requester)',
  })
  @ApiResponse({ status: 200, description: '{ deleted: number }' })
  @ApiCommonErrors()
  async removeAllMine(@CurrentUser() reqUser: RequestUser) {
    return this.companyRequestsService.removeAllMine(reqUser.identityId);
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
  @ApiResponse({
    status: 409,
    description: 'Already claimed by another company',
  })
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
    summary:
      'Mark a request as responded to (after opening a chat with the client)',
  })
  @ApiResponse({ status: 200, type: CompanyRequestResponseDto })
  @ApiCommonErrors()
  async markResponded(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
  ) {
    return this.companyRequestsService.markResponded(id, reqUser.identityId);
  }

  @Post(':id/offers')
  @ApiOperation({
    summary:
      'A company answers a request with an offer (message, notes, price); answering again updates it',
  })
  @ApiResponse({ status: 201, type: CompanyRequestResponseDto })
  @ApiCommonErrors()
  async respond(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: CreateRequestOfferDto,
  ) {
    return this.companyRequestsService.respond(id, reqUser.identityId, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a request this identity submitted (requester)',
  })
  @ApiResponse({ status: 200, description: '{ deleted: true }' })
  @ApiCommonErrors()
  async remove(@CurrentUser() reqUser: RequestUser, @Param('id') id: string) {
    return this.companyRequestsService.removeMine(id, reqUser.identityId);
  }

  @Patch(':id/accept-offer')
  @ApiOperation({
    summary:
      "Requester accepts the company's reply to their request (status responded -> accepted)",
  })
  @ApiResponse({ status: 200, type: CompanyRequestResponseDto })
  @ApiCommonErrors()
  async acceptOffer(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body('offerId') offerId?: string,
  ) {
    return this.companyRequestsService.acceptOffer(
      id,
      reqUser.identityId,
      offerId,
    );
  }

  @Patch(':id/reject-offer')
  @ApiOperation({
    summary:
      "Requester rejects the company's reply to their request (status responded -> rejected)",
  })
  @ApiResponse({ status: 200, type: CompanyRequestResponseDto })
  @ApiCommonErrors()
  async rejectOffer(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body('offerId') offerId?: string,
  ) {
    return this.companyRequestsService.rejectOffer(
      id,
      reqUser.identityId,
      offerId,
    );
  }
}
