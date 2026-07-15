import { Body, Controller, Post, Req, UseGuards, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import type { User } from '@prisma/client';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';

interface RequestWithUser extends Request {
  user: Omit<User, 'password'>;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // The LocalGuard automatically uses the DTO fields (identifier, password)
  // to run the LocalStrategy.
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(
    @Req() req: RequestWithUser,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() loginDto: LoginDto,
  ) {
    // req.user is populated by the LocalStrategy if successful
    return this.authService.login(req.user);
  }

  @Post('register/verify-otp')
  async verifyRegisterOtp(@Body() dto: { phone: string; otp: string }) {
    return this.authService.verifyRegistrationOtp(dto.phone, dto.otp);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}
