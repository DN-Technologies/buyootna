import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Param,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersRegistrationService } from './services/users-registration.service';
import { UsersProfileService } from './services/users-profile.service';
import { RegisterIndividualDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import {
  FindUserResponseDto,
  MeResponseDto,
  RegisterIndividualResponseDto,
  SimpleMessageResponseDto,
  UpdateProfileResponseDto,
  UserSafeDto,
} from './dto/user-response.dto';
import {
  OtpRequestRateLimit,
  OtpRequestRateLimitFromUser,
  OtpVerifyRateLimitFromUser,
} from '../../core/decorators/otp-rate-limit.decorator';
import { SuspendAccountDto } from './dto/suspend-account.dto';
import {
  RequestEmailOtpDto,
  RequestPhoneOtpDto,
  SetLoginMethodDto,
  VerifyEmailDto,
  VerifyPhoneDto,
} from './dto/login-method.dto';
import { LoginMethodService } from './services/login-method.service';
import { AccountSuspensionService } from './services/account-suspension.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly registrationService: UsersRegistrationService,
    private readonly profileService: UsersProfileService,
    private readonly suspensionService: AccountSuspensionService,
    private readonly loginMethodService: LoginMethodService,
  ) {}

  @Post('register/individual')
  @OtpRequestRateLimit('identifier')
  @ApiOperation({ summary: 'Register a new individual user account' })
  @ApiResponse({ status: 201, type: RegisterIndividualResponseDto })
  @ApiCommonErrors()
  async registerIndividual(@Body() dto: RegisterIndividualDto) {
    return this.registrationService.registerIndividual(dto);
  }

  // register/company, companies, company/:id now live in CompanyController;
  // register/office, offices, office/:id now live in OfficeController
  // (features/company, features/office) -- kept on the same `users` route
  // prefix via a separate controller class per account type, rather than
  // here.

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiAuth()
  @ApiOperation({
    summary:
      "Update the current user's profile fields, with optional logo upload",
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, type: UpdateProfileResponseDto })
  @ApiCommonErrors()
  async updateProfile(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const role = reqUser.identityType || Role.INDIVIDUAL;
    return this.profileService.updateProfile(reqUser.userId, role, dto, logo);
  }

  // profile/projects and profile/invoices (create + list) now live in
  // CompanyController -- company-only, moved alongside the rest of the
  // company-specific account endpoints.

  @UseGuards(AuthGuard('jwt'))
  @Patch('role')
  @ApiAuth()
  @ApiOperation({ summary: "Switch the current user's account role" })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { role: { type: 'string', enum: Object.values(Role) } },
      required: ['role'],
    },
  })
  @ApiResponse({ status: 200, type: UserSafeDto })
  @ApiCommonErrors()
  async switchRole(
    @CurrentUser() reqUser: RequestUser,
    @Body('role') role: Role,
  ) {
    return this.profileService.updateRole(reqUser.userId, role);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('account')
  @ApiAuth()
  @ApiOperation({ summary: "Permanently delete the current user's account" })
  @ApiResponse({ status: 200, type: SimpleMessageResponseDto })
  @ApiCommonErrors()
  async deleteAccount(@CurrentUser() reqUser: RequestUser) {
    return this.profileService.deleteAccount(reqUser.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('account/login-method')
  @ApiAuth()
  @ApiOperation({
    summary:
      'The identifier password login accepts (BOTH / EMAIL / PHONE), with the email/phone and whether the phone is verified',
  })
  @ApiCommonErrors()
  getLoginMethod(@CurrentUser() reqUser: RequestUser) {
    return this.loginMethodService.get(reqUser.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('account/login-method')
  @ApiAuth()
  @ApiOperation({
    summary:
      'Choose which identifier password login accepts: BOTH (default), EMAIL or PHONE',
    description:
      'PHONE needs an SMS-verified phone (400 PHONE_NOT_VERIFIED otherwise); EMAIL needs an email on the account (400 NO_EMAIL). Google/Apple sign-in and password recovery are unaffected.',
  })
  @ApiCommonErrors()
  setLoginMethod(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: SetLoginMethodDto,
  ) {
    return this.loginMethodService.set(reqUser.userId, dto.method);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('account/phone/request-otp')
  @OtpRequestRateLimitFromUser('userId')
  @ApiAuth()
  @ApiOperation({
    summary:
      'Text a code to the phone number to verify (and set) on the account',
  })
  @ApiCommonErrors()
  requestPhoneOtp(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: RequestPhoneOtpDto,
  ) {
    return this.loginMethodService.requestPhoneOtp(reqUser.userId, dto.phone);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('account/phone/verify')
  @OtpVerifyRateLimitFromUser('userId')
  @ApiAuth()
  @ApiOperation({
    summary: "Check the code; the number becomes the account's verified phone",
  })
  @ApiCommonErrors()
  verifyPhone(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: VerifyPhoneDto,
  ) {
    return this.loginMethodService.verifyPhone(
      reqUser.userId,
      dto.phone,
      dto.otp,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('account/email/request-otp')
  @OtpRequestRateLimitFromUser('userId')
  @ApiAuth()
  @ApiOperation({
    summary: 'Email a code to the address to verify (and set) on the account',
  })
  @ApiCommonErrors()
  requestEmailOtp(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: RequestEmailOtpDto,
  ) {
    return this.loginMethodService.requestEmailOtp(reqUser.userId, dto.email);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('account/email/verify')
  @OtpVerifyRateLimitFromUser('userId')
  @ApiAuth()
  @ApiOperation({
    summary: "Check the code; the address becomes the account's email",
  })
  @ApiCommonErrors()
  verifyEmail(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: VerifyEmailDto,
  ) {
    return this.loginMethodService.verifyEmail(
      reqUser.userId,
      dto.email,
      dto.otp,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('account/suspend/request-otp')
  @OtpRequestRateLimitFromUser('userId')
  @ApiAuth()
  @ApiOperation({
    summary:
      'Send the code confirming a temporary suspension (SMS, or email when there is no phone)',
  })
  @ApiResponse({
    status: 201,
    description: '{ channel: "phone" | "email", destination: masked }',
  })
  @ApiCommonErrors()
  requestSuspendOtp(@CurrentUser() reqUser: RequestUser) {
    return this.suspensionService.requestOtp(reqUser.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('account/suspend')
  @OtpVerifyRateLimitFromUser('userId')
  @ApiAuth()
  @ApiOperation({
    summary:
      'Temporarily suspend your account with the code and reasons; signing in again reactivates it',
    description:
      'Optional durationDays (7/14/30) makes it timed: it reactivates on its own when the period ends, and signing in before then answers 409 ACCOUNT_SCHEDULED_DEACTIVATION (see POST /auth/reactivate).',
  })
  @ApiResponse({ status: 201, type: SimpleMessageResponseDto })
  @ApiCommonErrors()
  suspendAccount(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: SuspendAccountDto,
  ) {
    return this.suspensionService.suspend(reqUser.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('account/disable')
  @ApiAuth()
  @ApiOperation({
    summary:
      "Deprecated (older app builds): temporarily disable the current user's account without a code. Use POST /users/account/suspend.",
    deprecated: true,
  })
  @ApiResponse({ status: 200, type: SimpleMessageResponseDto })
  @ApiCommonErrors()
  async disableAccount(@CurrentUser() reqUser: RequestUser) {
    return this.profileService.disableAccount(reqUser.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiAuth()
  @ApiOperation({
    summary:
      "Get the current user's full profile, active identity, and all identities",
  })
  @ApiResponse({ status: 200, type: MeResponseDto })
  @ApiCommonErrors()
  async getProfile(@CurrentUser() reqUser: RequestUser) {
    const fullUser = await this.profileService.findFullUser(reqUser.userId);
    if (!fullUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const { identities, ...userWithoutIdentities } = fullUser;
    // The persona this device's token carries -- other devices may be on
    // another one; isActive means "active on this device"
    const activeId =
      identities?.find((identity) => identity.id === reqUser.identityId)?.id ??
      identities?.find((identity) => identity.isActive)?.id ??
      identities?.[0]?.id;
    const deviceIdentities = (identities ?? []).map((identity) => ({
      ...identity,
      isActive: identity.id === activeId,
    }));

    const activeIdentity =
      deviceIdentities.find((identity) => identity.isActive) ?? null;

    return {
      // The free ad is per persona: the app reads it from here
      user: {
        ...userWithoutIdentities,
        freeAdsRemaining: activeIdentity?.freeAdsRemaining ?? 0,
      },
      activeIdentity,
      identities: deviceIdentities,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a user (and their identities) by user ID or identity ID',
  })
  @ApiParam({ name: 'id', description: 'User ID or identity ID' })
  @ApiResponse({ status: 200, type: FindUserResponseDto })
  @ApiCommonErrors()
  async findOne(@Param('id') id: string) {
    const fullUser = await this.profileService.findFullUser(id);
    // A suspended or blocked account's profile is hidden from others
    if (!fullUser || fullUser.isDisabled || fullUser.isBlocked) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return fullUser;
  }
}
