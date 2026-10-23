import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { DeviceCtx } from '../devices/sessions.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { TermsAcceptanceDto } from './dto/terms-acceptance.dto';
import { Request } from 'express';
import { SocialProvider, type User } from '@prisma/client';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import {
  ChangePasswordDto,
  RequestChangePasswordOtpDto,
} from './dto/change-password.dto';
import { VerifyRegisterOtpDto } from './dto/verify-register-otp.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { SwitchIdentityDto } from './dto/switch-identity.dto';
import { ReactivateAccountDto } from './dto/reactivate-account.dto';
import { AppleLoginDto, GoogleLoginDto } from './dto/social-login.dto';
import type { RequestUser } from './strategies/jwt.strategy';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import { LoginResponseDto, MessageResponseDto } from './dto/user-response.dto';
import { GoogleAuthService } from './services/google-auth.service';
import { AppleAuthService } from './services/apple-auth.service';
import {
  OtpVerifyRateLimit,
  OtpRequestRateLimitFromUser,
  OtpVerifyRateLimitFromUser,
} from '../../core/decorators/otp-rate-limit.decorator';

interface RequestWithUser extends Request {
  user: Omit<User, 'password'>;
}

function extractDeviceCtx(req: RequestWithUser | Request): DeviceCtx {
  return {
    deviceId: req.headers['x-device-id'] as string | undefined,
    platform: req.headers['x-device-platform'] as string | undefined,
    deviceModel: req.headers['x-device-model'] as string | undefined,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly appleAuthService: AppleAuthService,
  ) {}

  // The LocalGuard automatically uses the DTO fields (identifier, password)
  // to run the LocalStrategy.
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({
    summary:
      'Log in with email/phone + password, returns a JWT and identity info',
    description:
      "identityType (INDIVIDUAL / COMPANY / OFFICE) opens that persona of the account directly; without it, the one this device or account used last. A type the account doesn't have: 403 IDENTITY_TYPE_NOT_FOUND with availableTypes.",
  })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @ApiCommonErrors()
  login(@Req() req: RequestWithUser, @Body() loginDto: LoginDto) {
    // req.user is populated by the LocalStrategy if successful; the persona
    // it opens is the one picked on the login screen, if any
    this.recordTerms(req.user.id, loginDto);
    return this.authService.login(req.user, undefined, extractDeviceCtx(req), {
      identityType: loginDto.identityType,
    });
  }

  @Post('reactivate')
  @ApiOperation({
    summary:
      'Finish a sign-in paused by a timed self-deactivation: ends the deactivation early and logs in',
    description:
      'Any sign-in (password, OTP, Google, Apple) to an account deactivated for a period that has not ended returns 409 ACCOUNT_SCHEDULED_DEACTIVATION with daysLeft and a reactivationTicket (valid 10 minutes). Posting that ticket here reactivates the account and returns the normal login response with reactivated: true.',
  })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @ApiCommonErrors()
  reactivate(@Req() req: RequestWithUser, @Body() dto: ReactivateAccountDto) {
    return this.authService.loginWithReactivationTicket(
      dto.ticket,
      extractDeviceCtx(req),
    );
  }

  @Post('google')
  @ApiOperation({
    summary: 'Sign in or register via a verified Google ID token',
  })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @ApiCommonErrors()
  async googleLogin(@Req() req: RequestWithUser, @Body() dto: GoogleLoginDto) {
    const profile = await this.googleAuthService.verifyIdToken(dto.idToken);
    const result = await this.authService.loginOrRegisterWithSocial(
      SocialProvider.GOOGLE,
      profile,
      extractDeviceCtx(req),
    );
    this.recordTerms(result?.user?.id, dto);
    return result;
  }

  @Post('apple')
  @ApiOperation({
    summary: 'Sign in or register via a verified Apple identity token',
  })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @ApiCommonErrors()
  async appleLogin(@Req() req: RequestWithUser, @Body() dto: AppleLoginDto) {
    const profile = await this.appleAuthService.verifyIdentityToken(
      dto.identityToken,
    );
    const result = await this.authService.loginOrRegisterWithSocial(
      SocialProvider.APPLE,
      profile,
      extractDeviceCtx(req),
    );
    this.recordTerms(result?.user?.id, dto);
    return result;
  }

  @Post('register/verify-otp')
  @OtpVerifyRateLimit('phone')
  @ApiOperation({
    summary: 'Verify the OTP sent during registration and log the user in',
  })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @ApiCommonErrors()
  async verifyRegisterOtp(
    @Req() req: RequestWithUser,
    @Body() dto: VerifyRegisterOtpDto,
  ) {
    const result = await this.authService.verifyRegistrationOtp(
      dto.phone,
      dto.otp,
      extractDeviceCtx(req),
    );
    this.recordTerms(result?.user?.id, dto);
    return result;
  }

  @Post('register/verify-email-otp')
  @OtpVerifyRateLimit('email')
  @ApiOperation({
    summary:
      'Verify the OTP sent to an email during registration, creating the account and logging the user in',
  })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @ApiCommonErrors()
  async verifyEmailRegisterOtp(
    @Req() req: RequestWithUser,
    @Body() dto: VerifyEmailOtpDto,
  ) {
    const result = await this.authService.verifyEmailRegistrationOtp(
      dto.email,
      dto.otp,
      extractDeviceCtx(req),
    );
    this.recordTerms(result?.user?.id, dto);
    return result;
  }

  // Dev/CI only — 404s unless MailService is in mock mode (RESEND_API_KEY
  // unset), which is never true in production. Lets black-box e2e tools
  // (Maestro) read an OTP a mock "email" was sent, since they drive the app
  // from a separate process with no way to inspect server memory directly.
  @Get('register/debug-email-otp')
  @ApiOperation({
    summary:
      "Dev/CI only: read a pending email signup's mock OTP. 404s unless mail is in mock mode.",
  })
  debugEmailOtp(@Query('email') email: string) {
    const otp = this.authService.getMockEmailOtp(email);
    if (!otp) {
      throw new NotFoundException();
    }
    return { otp };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('identity/switch')
  @ApiAuth()
  @ApiOperation({
    summary:
      "Switch the current user's active identity and issue a new JWT for it",
  })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @ApiCommonErrors()
  async switchIdentity(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: SwitchIdentityDto,
  ) {
    return this.authService.switchIdentity(
      reqUser.userId,
      dto.identityId,
      reqUser.sessionId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password/request-otp')
  @OtpRequestRateLimitFromUser('userId')
  @ApiAuth()
  @ApiOperation({
    summary:
      'Request an OTP to authorize a password change for the current user',
  })
  @ApiResponse({ status: 201, type: MessageResponseDto })
  @ApiCommonErrors()
  async requestChangePasswordOtp(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: RequestChangePasswordOtpDto,
  ) {
    return this.authService.requestChangePasswordOtp(
      reqUser.user as User,
      dto.oldPassword,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('change-password')
  @OtpVerifyRateLimitFromUser('userId')
  @ApiAuth()
  @ApiOperation({
    summary:
      "Change the current user's password using an OTP, optionally logging out other devices",
  })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  @ApiCommonErrors()
  async changePassword(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      reqUser.userId,
      dto.oldPassword,
      dto.newPassword,
      dto.otp,
      dto.logoutAllDevices,
      reqUser.sessionId,
    );
  }

  // The terms checkbox (Guideline 1.2): recorded once the sign-in succeeded,
  // without holding up the answer
  private recordTerms(
    userId: string | undefined,
    dto: TermsAcceptanceDto,
  ): void {
    if (dto.acceptTerms && userId) {
      void this.authService.recordTermsAccepted(userId);
    }
  }
}
