import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecoveryService } from './recovery.service';
import { EmailOtpService } from '../../core/email-otp/email-otp.service';
import {
  RequestOtpDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/recovery.dto';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import {
  RecoveryMessageResponseDto,
  VerifyOtpResponseDto,
} from './dto/recovery-response.dto';
import {
  OtpRequestRateLimit,
  OtpVerifyRateLimit,
} from '../../core/decorators/otp-rate-limit.decorator';

@ApiTags('Recovery')
@Controller('auth/recovery')
export class RecoveryController {
  constructor(
    private readonly recoveryService: RecoveryService,
    private readonly emailOtpService: EmailOtpService,
  ) {}

  @Post('request-otp')
  @OtpRequestRateLimit('identifier')
  @ApiOperation({
    summary: 'Request a password-reset OTP for an email or phone identifier',
  })
  @ApiResponse({ status: 201, type: RecoveryMessageResponseDto })
  @ApiCommonErrors()
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.recoveryService.requestOtp(dto);
  }

  @Post('verify-otp')
  @OtpVerifyRateLimit('identifier')
  @ApiOperation({
    summary:
      'Verify the password-reset OTP and receive a temporary reset token',
  })
  @ApiResponse({ status: 201, type: VerifyOtpResponseDto })
  @ApiCommonErrors()
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.recoveryService.verifyOtp(dto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Set a new password using the temporary reset token',
  })
  @ApiResponse({ status: 201, type: RecoveryMessageResponseDto })
  @ApiCommonErrors()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.recoveryService.resetPassword(dto);
  }

  // Dev/CI only — 404s unless MailService is in mock mode (RESEND_API_KEY
  // unset), which is never true in production. Lets black-box e2e tools
  // (Maestro) read the OTP a mock "email" was sent for a password-reset
  // request, since they drive the app from a separate process with no way
  // to inspect server memory directly.
  @Get('debug-email-otp')
  @ApiOperation({
    summary:
      'Dev/CI only: read a pending password-reset email OTP. 404s unless mail is in mock mode.',
  })
  debugEmailOtp(@Query('email') email: string) {
    const otp = this.emailOtpService.getMockPasswordResetOtp(email);
    if (!otp) {
      throw new NotFoundException();
    }
    return { otp };
  }
}
