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
import { UsersRegistrationService } from './services/users-registration.service';
import { UsersProfileService } from './services/users-profile.service';
import { UsersDirectoryService } from './services/users-directory.service';
import {
  RegisterCompanyDto,
  RegisterIndividualDto,
  RegisterOfficeDto,
} from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { Role } from '@prisma/client';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { GetCompaniesFilterDto } from './dto/get-companies-filter.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly registrationService: UsersRegistrationService,
    private readonly profileService: UsersProfileService,
    private readonly directoryService: UsersDirectoryService,
  ) {}

  @Post('register/individual')
  async registerIndividual(@Body() dto: RegisterIndividualDto) {
    return this.registrationService.registerIndividual(dto);
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

    return this.registrationService.registerCompany(dto, logoFile, licenseFile);
  }

  @Get('companies')
  async findAllCompanies(@Query() filters: GetCompaniesFilterDto) {
    return this.directoryService.findCompanies(filters);
  }

  @Get('company/:id')
  async findCompanyDetails(@Param('id') id: string) {
    return this.directoryService.findCompanyDetails(id);
  }

  @Get('office/:id')
  async findOfficeDetails(@Param('id') id: string) {
    return this.directoryService.findOfficeDetails(id);
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

    return this.registrationService.registerOffice(dto, logoFile, licenseFile);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  @UseInterceptors(FileInterceptor('logo'))
  async updateProfile(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const role = reqUser.identityType || Role.INDIVIDUAL;
    return this.profileService.updateProfile(reqUser.userId, role, dto, logo);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('role')
  async switchRole(
    @CurrentUser() reqUser: RequestUser,
    @Body('role') role: Role,
  ) {
    return this.profileService.updateRole(reqUser.userId, role);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('account')
  async deleteAccount(@CurrentUser() reqUser: RequestUser) {
    return this.profileService.deleteAccount(reqUser.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('account/disable')
  async disableAccount(@CurrentUser() reqUser: RequestUser) {
    return this.profileService.disableAccount(reqUser.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@CurrentUser() reqUser: RequestUser) {
    const fullUser = await this.profileService.findFullUser(reqUser.userId);
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
    const fullUser = await this.profileService.findFullUser(id);
    if (!fullUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return fullUser;
  }
}
