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
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
import { GetOfficesFilterDto } from './dto/get-offices-filter.dto';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import {
  CompanyDetailsResponseDto,
  CompanyListResponseDto,
  FindUserResponseDto,
  MeResponseDto,
  OfficeDetailsResponseDto,
  OfficeListResponseDto,
  RegisterCompanyResponseDto,
  RegisterIndividualResponseDto,
  RegisterOfficeResponseDto,
  SimpleMessageResponseDto,
  UpdateProfileResponseDto,
  UserSafeDto,
} from './dto/user-response.dto';

const LOGO_LICENSE_UPLOAD_BODY = {
  schema: {
    type: 'object' as const,
    properties: {
      logo: { type: 'string', format: 'binary' },
      license: { type: 'string', format: 'binary' },
    },
  },
};

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly registrationService: UsersRegistrationService,
    private readonly profileService: UsersProfileService,
    private readonly directoryService: UsersDirectoryService,
  ) {}

  @Post('register/individual')
  @ApiOperation({ summary: 'Register a new individual user account' })
  @ApiResponse({ status: 201, type: RegisterIndividualResponseDto })
  @ApiCommonErrors()
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
  @ApiOperation({
    summary:
      'Register a new company account, with optional logo/license file upload',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(LOGO_LICENSE_UPLOAD_BODY)
  @ApiResponse({ status: 201, type: RegisterCompanyResponseDto })
  @ApiCommonErrors()
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
  @ApiOperation({
    summary: 'List approved companies, paginated and filterable',
  })
  @ApiResponse({ status: 200, type: CompanyListResponseDto })
  @ApiCommonErrors()
  async findAllCompanies(@Query() filters: GetCompaniesFilterDto) {
    return this.directoryService.findCompanies(filters);
  }

  @Get('company/:id')
  @ApiOperation({
    summary: 'Get public details for a company by identity or user ID',
  })
  @ApiParam({ name: 'id', description: 'Company identity ID or user ID' })
  @ApiResponse({ status: 200, type: CompanyDetailsResponseDto })
  @ApiCommonErrors()
  async findCompanyDetails(@Param('id') id: string) {
    return this.directoryService.findCompanyDetails(id);
  }

  @Get('offices')
  @ApiOperation({
    summary: 'List approved real-estate offices, paginated and filterable',
  })
  @ApiResponse({ status: 200, type: OfficeListResponseDto })
  @ApiCommonErrors()
  async findAllOffices(@Query() filters: GetOfficesFilterDto) {
    return this.directoryService.findOffices(filters);
  }

  @Get('office/:id')
  @ApiOperation({
    summary: 'Get public details for an office by identity or user ID',
  })
  @ApiParam({ name: 'id', description: 'Office identity ID or user ID' })
  @ApiResponse({ status: 200, type: OfficeDetailsResponseDto })
  @ApiCommonErrors()
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
  @ApiOperation({
    summary:
      'Register a new office account, with optional logo/license file upload',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(LOGO_LICENSE_UPLOAD_BODY)
  @ApiResponse({ status: 201, type: RegisterOfficeResponseDto })
  @ApiCommonErrors()
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
  @ApiAuth()
  @ApiOperation({
    summary:
      "Update the current user's profile fields, with optional logo upload",
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, type: UpdateProfileResponseDto })
  @ApiCommonErrors()
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
  @ApiAuth()
  @ApiOperation({ summary: "Switch the current user's account role" })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { role: { type: 'string', enum: Object.values(Role) } },
      required: ['role'],
    },
  })
  @ApiResponse({ status: 200, type: UserSafeDto })
  @ApiCommonErrors()
  async switchRole(
    @CurrentUser() reqUser: RequestUser,
    @Body('role') role: Role,
  ) {
    return this.profileService.updateRole(reqUser.userId, role);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('account')
  @ApiAuth()
  @ApiOperation({ summary: "Permanently delete the current user's account" })
  @ApiResponse({ status: 200, type: SimpleMessageResponseDto })
  @ApiCommonErrors()
  async deleteAccount(@CurrentUser() reqUser: RequestUser) {
    return this.profileService.deleteAccount(reqUser.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('account/disable')
  @ApiAuth()
  @ApiOperation({ summary: "Temporarily disable the current user's account" })
  @ApiResponse({ status: 200, type: SimpleMessageResponseDto })
  @ApiCommonErrors()
  async disableAccount(@CurrentUser() reqUser: RequestUser) {
    return this.profileService.disableAccount(reqUser.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiAuth()
  @ApiOperation({
    summary:
      "Get the current user's full profile, active identity, and all identities",
  })
  @ApiResponse({ status: 200, type: MeResponseDto })
  @ApiCommonErrors()
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
  @ApiOperation({
    summary: 'Get a user (and their identities) by user ID or identity ID',
  })
  @ApiParam({ name: 'id', description: 'User ID or identity ID' })
  @ApiResponse({ status: 200, type: FindUserResponseDto })
  @ApiCommonErrors()
  async findOne(@Param('id') id: string) {
    const fullUser = await this.profileService.findFullUser(id);
    if (!fullUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return fullUser;
  }
}
