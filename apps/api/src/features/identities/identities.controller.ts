import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
    return this.identitiesService.findCurrent(
      reqUser.userId,
      reqUser.identityId,
    );
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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'license', maxCount: 1 },
    ]),
  )
  createCompany(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateCompanyIdentityDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      license?: Express.Multer.File[];
    },
  ) {
    const logoFile = files.logo ? files.logo[0] : undefined;
    const licenseFile = files.license ? files.license[0] : undefined;
    return this.identitiesService.createCompany(
      reqUser.userId,
      dto,
      logoFile,
      licenseFile,
    );
  }

  // POST /identities/office - Create office identity
  @Post('office')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'license', maxCount: 1 },
    ]),
  )
  createOffice(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateOfficeIdentityDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      license?: Express.Multer.File[];
    },
  ) {
    const logoFile = files.logo ? files.logo[0] : undefined;
    const licenseFile = files.license ? files.license[0] : undefined;
    return this.identitiesService.createOffice(
      reqUser.userId,
      dto,
      logoFile,
      licenseFile,
    );
  }

  // PATCH /identities/:id - Update identity profile
  @Patch(':id')
  update(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body()
    dto:
      | UpdateIndividualIdentityDto
      | UpdateCompanyIdentityDto
      | UpdateOfficeIdentityDto,
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
