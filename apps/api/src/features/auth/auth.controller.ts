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
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { SocialProvider, type User } from '@prisma/client';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyRegisterOtpDto } from './dto/verify-register-otp.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { SwitchIdentityDto } from './dto/switch-identity.dto';
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
  })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @ApiCommonErrors()
  login(
    @Req() req: RequestWithUser,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() loginDto: LoginDto,
  ) {
    // req.user is populated by the LocalStrategy if successful
    return this.authService.login(req.user);
  }

  @Post('google')
  @ApiOperation({
    summary: 'Sign in or register via a verified Google ID token',
  })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @ApiCommonErrors()
  async googleLogin(@Body() dto: GoogleLoginDto) {
    const profile = await this.googleAuthService.verifyIdToken(dto.idToken);
    return this.authService.loginOrRegisterWithSocial(
      SocialProvider.GOOGLE,
      profile,
    );
  }

  @Post('apple')
  @ApiOperation({
    summary: 'Sign in or register via a verified Apple identity token',
  })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @ApiCommonErrors()
  async appleLogin(@Body() dto: AppleLoginDto) {
    const profile = await this.appleAuthService.verifyIdentityToken(
      dto.identityToken,
    );
    return this.authService.loginOrRegisterWithSocial(
      SocialProvider.APPLE,
      profile,
    );
  }

  @Post('register/verify-otp')
  @OtpVerifyRateLimit('phone')
  @ApiOperation({
    summary: 'Verify the OTP sent during registration and log the user in',
  })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @ApiCommonErrors()
  async verifyRegisterOtp(@Body() dto: VerifyRegisterOtpDto) {
    return this.authService.verifyRegistrationOtp(dto.phone, dto.otp);
  }

  @Post('register/verify-email-otp')
  @OtpVerifyRateLimit('email')
  @ApiOperation({
    summary:
      'Verify the OTP sent to an email during registration, creating the account and logging the user in',
  })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @ApiCommonErrors()
  async verifyEmailRegisterOtp(@Body() dto: VerifyEmailOtpDto) {
    return this.authService.verifyEmailRegistrationOtp(dto.email, dto.otp);
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
    return this.authService.switchIdentity(reqUser.userId, dto.identityId);
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
  async requestChangePasswordOtp(@CurrentUser() reqUser: RequestUser) {
    return this.authService.requestChangePasswordOtp(reqUser.user as User);
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
    );
  }
}
