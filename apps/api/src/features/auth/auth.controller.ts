import { Body, Controller, Post, Req, UseGuards, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import type { User } from '@prisma/client';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyRegisterOtpDto } from './dto/verify-register-otp.dto';
import { SwitchIdentityDto } from './dto/switch-identity.dto';
import type { RequestUser } from './strategies/jwt.strategy';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import { LoginResponseDto, MessageResponseDto } from './dto/user-response.dto';

interface RequestWithUser extends Request {
  user: Omit<User, 'password'>;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // The LocalGuard automatically uses the DTO fields (identifier, password)
  // to run the LocalStrategy.
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Log in with email/phone + password, returns a JWT and identity info' })
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

  @Post('register/verify-otp')
  @ApiOperation({ summary: 'Verify the OTP sent during registration and log the user in' })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  @ApiCommonErrors()
  async verifyRegisterOtp(@Body() dto: VerifyRegisterOtpDto) {
    return this.authService.verifyRegistrationOtp(dto.phone, dto.otp);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('identity/switch')
  @ApiAuth()
  @ApiOperation({ summary: "Switch the current user's active identity and issue a new JWT for it" })
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
  @ApiAuth()
  @ApiOperation({ summary: 'Request an OTP to authorize a password change for the current user' })
  @ApiResponse({ status: 201, type: MessageResponseDto })
  @ApiCommonErrors()
  async requestChangePasswordOtp(@CurrentUser() reqUser: RequestUser) {
    return this.authService.requestChangePasswordOtp(reqUser.user as User);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('change-password')
  @ApiAuth()
  @ApiOperation({ summary: "Change the current user's password using an OTP, optionally logging out other devices" })
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
