import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IdentitiesService } from './identities.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import {
  CreateIndividualIdentityDto,
  CreateCompanyIdentityDto,
  CreateOfficeIdentityDto,
  UpdateIndividualIdentityDto,
  UpdateCompanyIdentityDto,
  UpdateOfficeIdentityDto,
} from './dto';

@Controller('identities')
@UseGuards(AuthGuard('jwt'))
export class IdentitiesController {
  constructor(private readonly identitiesService: IdentitiesService) {}

  // GET /identities - List all user's identities
  @Get()
  findAll(@CurrentUser() reqUser: RequestUser) {
    return this.identitiesService.findAll(reqUser.userId);
  }

  // GET /identities/current - Get active identity details
  @Get('current')
  findCurrent(@CurrentUser() reqUser: RequestUser) {
    return this.identitiesService.findCurrent(reqUser.userId, reqUser.identityId);
  }

  // GET /identities/:id - Get specific identity
  @Get(':id')
  findOne(@CurrentUser() reqUser: RequestUser, @Param('id') id: string) {
    return this.identitiesService.findOne(reqUser.userId, id);
  }

  // POST /identities/individual - Create individual identity
  @Post('individual')
  createIndividual(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateIndividualIdentityDto,
  ) {
    return this.identitiesService.createIndividual(reqUser.userId, dto);
  }

  // POST /identities/company - Create company identity
  @Post('company')
  createCompany(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateCompanyIdentityDto,
  ) {
    return this.identitiesService.createCompany(reqUser.userId, dto);
  }

  // POST /identities/office - Create office identity
  @Post('office')
  createOffice(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateOfficeIdentityDto,
  ) {
    return this.identitiesService.createOffice(reqUser.userId, dto);
  }

  // PATCH /identities/:id - Update identity profile
  @Patch(':id')
  update(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateIndividualIdentityDto | UpdateCompanyIdentityDto | UpdateOfficeIdentityDto,
  ) {
    return this.identitiesService.update(reqUser.userId, id, dto);
  }

  // DELETE /identities/:id - Delete identity
  @Delete(':id')
  delete(@CurrentUser() reqUser: RequestUser, @Param('id') id: string) {
    return this.identitiesService.delete(reqUser.userId, id);
  }
}

// Public controller for viewing other users' profiles
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly identitiesService: IdentitiesService) {}

  // GET /profiles/:identityId - Get public profile
  @Get(':identityId')
  getPublicProfile(@Param('identityId') identityId: string) {
    return this.identitiesService.getPublicProfile(identityId);
  }
}
