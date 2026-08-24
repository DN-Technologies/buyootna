import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecoveryService } from './recovery.service';
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

@ApiTags('Recovery')
@Controller('auth/recovery')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @Post('request-otp')
  @ApiOperation({
    summary: 'Request a password-reset OTP for an email or phone identifier',
  })
  @ApiResponse({ status: 201, type: RecoveryMessageResponseDto })
  @ApiCommonErrors()
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.recoveryService.requestOtp(dto);
  }

  @Post('verify-otp')
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
}
