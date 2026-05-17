import { Body, Controller, Post } from '@nestjs/common';
import { RecoveryService } from './recovery.service';
import {
  RequestOtpDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/recovery.dto';

@Controller('auth/recovery')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @Post('request-otp')
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.recoveryService.requestOtp(dto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.recoveryService.verifyOtp(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.recoveryService.resetPassword(dto);
  }
}
