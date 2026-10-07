import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { IdentitiesService } from './identities.service';
import { IdentityContactPhoneService } from './identity-contact-phone.service';
import { SetUseAccountPhoneDto } from './dto/contact-phone.dto';
import {
  RequestPhoneOtpDto,
  VerifyPhoneDto,
} from '../users/dto/login-method.dto';
import {
  OtpRequestRateLimitFromUser,
  OtpVerifyRateLimitFromUser,
} from '../../core/decorators/otp-rate-limit.decorator';
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
  constructor(
    private readonly identitiesService: IdentitiesService,
    private readonly contactPhone: IdentityContactPhoneService,
  ) {}

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

  // --- Contact phone of the active persona (رقم التواصل) ---
  @Get('current/contact-phone')
  @ApiOperation({
    summary:
      "The active persona's contact phone and whether it uses the account's",
  })
  @ApiCommonErrors()
  getContactPhone(@CurrentUser() reqUser: RequestUser) {
    return this.contactPhone.get(reqUser.userId, reqUser.identityId);
  }

  @Post('current/contact-phone/request-otp')
  @OtpRequestRateLimitFromUser('userId')
  @ApiOperation({
    summary: "Text a code to the number to use as the active persona's own",
  })
  @ApiCommonErrors()
  requestContactPhoneOtp(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: RequestPhoneOtpDto,
  ) {
    return this.contactPhone.requestOtp(
      reqUser.userId,
      reqUser.identityId,
      dto.phone,
    );
  }

  @Post('current/contact-phone/verify')
  @OtpVerifyRateLimitFromUser('userId')
  @ApiOperation({
    summary: "Check the code; the number becomes the active persona's own",
  })
  @ApiCommonErrors()
  verifyContactPhone(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: VerifyPhoneDto,
  ) {
    return this.contactPhone.verify(
      reqUser.userId,
      reqUser.identityId,
      dto.phone,
      dto.otp,
    );
  }

  @Patch('current/contact-phone')
  @ApiOperation({
    summary: "Use the account's phone, or the persona's own verified number",
  })
  @ApiCommonErrors()
  setUseAccountPhone(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: SetUseAccountPhoneDto,
  ) {
    return this.contactPhone.setUseAccountPhone(
      reqUser.userId,
      reqUser.identityId,
      dto.useAccountPhone,
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
  // Accepts JSON or multipart/form-data -- company/office updates may carry
  // a new logo and/or licence file alongside the fields (mirrors
  // POST /identities/company; without files the parts are simply absent).
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'license', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary:
      "Update one of the current user's identities (shape depends on identity type; company/office may attach logo/license files)",
  })
  @ApiParam({ name: 'id', description: 'Identity ID' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(UpdateIndividualIdentityDto) },
        { $ref: getSchemaPath(UpdateCompanyIdentityDto) },
        { $ref: getSchemaPath(UpdateOfficeIdentityDto) },
        {
          type: 'object',
          properties: {
            logo: { type: 'string', format: 'binary' },
            license: { type: 'string', format: 'binary' },
          },
        },
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
    @UploadedFiles()
    files?: {
      logo?: Express.Multer.File[];
      license?: Express.Multer.File[];
    },
  ) {
    return this.identitiesService.update(
      reqUser.userId,
      id,
      dto,
      files?.logo?.[0],
      files?.license?.[0],
    );
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
