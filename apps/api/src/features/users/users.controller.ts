import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Param,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  RegisterCompanyDto,
  RegisterIndividualDto,
  RegisterOfficeDto,
} from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { Role } from '@prisma/client';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { GetCompaniesFilterDto } from './dto/get-companies-filter.dto';

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

  @Get('companies')
  async findAllCompanies(@Query() filters: GetCompaniesFilterDto) {
    return this.usersService.findCompanies(filters);
  }

  @Get('company/:id')
  async findCompanyDetails(@Param('id') id: string) {
    return this.usersService.findCompanyDetails(id);
  }

  @Post('register/office')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'license', maxCount: 1 },
    ]),
  )
  async registerOffice(
    @Body() dto: RegisterOfficeDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      license?: Express.Multer.File[];
    },
  ) {
    const logoFile = files.logo ? files.logo[0] : undefined;
    const licenseFile = files.license ? files.license[0] : undefined;

    return this.usersService.registerOffice(dto, logoFile, licenseFile);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  @UseInterceptors(FileInterceptor('logo'))
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const role = user.role || Role.INDIVIDUAL;
    return this.usersService.updateProfile(user.id, role, dto, logo);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('role')
  async switchRole(@CurrentUser() user: User, @Body('role') role: Role) {
    return this.usersService.updateRole(user.id, role);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('account')
  async deleteAccount(@CurrentUser() user: User) {
    return this.usersService.deleteAccount(user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('account/disable')
  async disableAccount(@CurrentUser() user: User) {
    return this.usersService.disableAccount(user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@CurrentUser() user: User) {
    const fullUser = await this.usersService.findFullUser(user.id);
    if (!fullUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const { identities, ...userWithoutIdentities } = fullUser;
    const activeIdentity =
      identities?.find((identity) => identity.isActive) ??
      identities?.[0] ??
      null;

    return {
      user: userWithoutIdentities,
      activeIdentity,
      identities: identities ?? [],
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const fullUser = await this.usersService.findFullUser(id);
    if (!fullUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return fullUser;
  }
}
