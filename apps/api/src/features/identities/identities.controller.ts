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
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { IdentitiesService } from './identities.service';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import {
  CreateIndividualIdentityDto,
  UpdateIndividualIdentityDto,
  UpdateCompanyIdentityDto,
  UpdateOfficeIdentityDto,
} from './dto';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import {
  DeleteIdentityResponseDto,
  IdentityResponseDto,
  PublicProfileResponseDto,
} from './dto/identity-response.dto';

@ApiTags('Identities')
@ApiAuth()
@ApiExtraModels(
  UpdateIndividualIdentityDto,
  UpdateCompanyIdentityDto,
  UpdateOfficeIdentityDto,
)
@Controller('identities')
@UseGuards(AuthGuard('jwt'))
export class IdentitiesController {
  constructor(private readonly identitiesService: IdentitiesService) {}

  // GET /identities - List all user's identities
  @Get()
  @ApiOperation({ summary: "List all of the current user's identities" })
  @ApiResponse({ status: 200, type: [IdentityResponseDto] })
  @ApiCommonErrors()
  findAll(@CurrentUser() reqUser: RequestUser) {
    return this.identitiesService.findAll(reqUser.userId);
  }

  // GET /identities/current - Get active identity details
  @Get('current')
  @ApiOperation({ summary: "Get the current user's active identity" })
  @ApiResponse({ status: 200, type: IdentityResponseDto })
  @ApiCommonErrors()
  findCurrent(@CurrentUser() reqUser: RequestUser) {
    return this.identitiesService.findCurrent(
      reqUser.userId,
      reqUser.identityId,
    );
  }

  // GET /identities/:id - Get specific identity
  @Get(':id')
  @ApiOperation({ summary: "Get one of the current user's identities by ID" })
  @ApiParam({ name: 'id', description: 'Identity ID' })
  @ApiResponse({ status: 200, type: IdentityResponseDto })
  @ApiCommonErrors()
  findOne(@CurrentUser() reqUser: RequestUser, @Param('id') id: string) {
    return this.identitiesService.findOne(reqUser.userId, id);
  }

  // POST /identities/individual - Create individual identity
  @Post('individual')
  @ApiOperation({
    summary: 'Create an individual identity for the current user',
  })
  @ApiResponse({ status: 201, type: IdentityResponseDto })
  @ApiCommonErrors()
  createIndividual(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateIndividualIdentityDto,
  ) {
    return this.identitiesService.createIndividual(reqUser.userId, dto);
  }

  // POST /identities/company and POST /identities/office now live in
  // CompanyIdentityController / OfficeIdentityController (features/company,
  // features/office) -- kept on the same `identities` route prefix via a
  // separate controller class per account type, rather than here.

  // PATCH /identities/:id - Update identity profile
  @Patch(':id')
  @ApiOperation({
    summary:
      "Update one of the current user's identities (shape depends on identity type)",
  })
  @ApiParam({ name: 'id', description: 'Identity ID' })
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(UpdateIndividualIdentityDto) },
        { $ref: getSchemaPath(UpdateCompanyIdentityDto) },
        { $ref: getSchemaPath(UpdateOfficeIdentityDto) },
      ],
    },
  })
  @ApiResponse({ status: 200, type: IdentityResponseDto })
  @ApiCommonErrors()
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
  @ApiOperation({
    summary:
      "Delete one of the current user's identities (must not be the last one or own properties)",
  })
  @ApiParam({ name: 'id', description: 'Identity ID' })
  @ApiResponse({ status: 200, type: DeleteIdentityResponseDto })
  @ApiCommonErrors()
  delete(@CurrentUser() reqUser: RequestUser, @Param('id') id: string) {
    return this.identitiesService.delete(reqUser.userId, id);
  }
}

// Public controller for viewing other users' profiles
@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly identitiesService: IdentitiesService) {}

  // GET /profiles/:identityId - Get public profile
  @Get(':identityId')
  @ApiOperation({ summary: 'Get the public profile for any identity by ID' })
  @ApiParam({ name: 'identityId', description: 'Identity ID' })
  @ApiResponse({ status: 200, type: PublicProfileResponseDto })
  @ApiCommonErrors()
  getPublicProfile(@Param('identityId') identityId: string) {
    return this.identitiesService.getPublicProfile(identityId);
  }
}
