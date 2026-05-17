import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterCompanyDto, RegisterIndividualDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register/individual')
  async registerIndividual(@Body() dto: RegisterIndividualDto) {
    return this.usersService.registerIndividual(dto);
  }

  @Post('register/company')
  async registerCompany(@Body() dto: RegisterCompanyDto) {
    return this.usersService.registerCompany(dto);
  }

  @UseGuards(AuthGuard('jwt')) // This forces the request to have a valid Bearer Token
  @Get('me')
  getProfile(@CurrentUser() user: User) {
    // If the token is valid, it returns the decoded payload (userId, email, role)
    return {
      message: 'You have successfully accessed a protected route!',
      user: user,
    };
  }
}
