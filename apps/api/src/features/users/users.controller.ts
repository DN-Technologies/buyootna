import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterCompanyDto } from './dto/register.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register/individual')
  async registerIndividual(@Body() dto: RegisterCompanyDto) {
    return this.usersService.registerIndividual(dto);
  }

  @Post('register/company')
  async registerCompany(@Body() dto: RegisterCompanyDto) {
    return this.usersService.registerCompany(dto);
  }
}
