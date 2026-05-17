import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { User } from '@prisma/client';

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
}
