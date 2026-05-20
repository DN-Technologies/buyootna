import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterCompanyDto, RegisterIndividualDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register/individual')
  async registerIndividual(@Body() dto: RegisterIndividualDto) {
    return this.usersService.registerIndividual(dto);
  }

  @Post('register/company')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'license', maxCount: 1 },
    ]),
  )
  async registerCompany(
    @Body() dto: RegisterCompanyDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      license?: Express.Multer.File[];
    },
  ) {
    // Extract the single file from the arrays pprovided by Multer
    const logoFile = files.logo ? files.logo[0] : undefined;
    const licenseFile = files.license ? files.license[0] : undefined;

    return this.usersService.registerCompany(dto, logoFile, licenseFile);
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
