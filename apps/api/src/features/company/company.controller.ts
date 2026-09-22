import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { CreateCompanyInvoiceDto } from './dto/create-company-invoice.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { GetCompaniesFilterDto } from './dto/get-companies-filter.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import {
  CompanyDetailsResponseDto,
  CompanyListResponseDto,
  RegisterCompanyResponseDto,
} from './dto/company-response.dto';
import { UsersDirectoryService } from '../users/services/users-directory.service';
import { UsersProfileService } from '../users/services/users-profile.service';
import { UsersRegistrationService } from '../users/services/users-registration.service';

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
export class CompanyController {
  constructor(
    private readonly registrationService: UsersRegistrationService,
    private readonly profileService: UsersProfileService,
    private readonly directoryService: UsersDirectoryService,
  ) {}

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

  @UseGuards(AuthGuard('jwt'))
  @Post('profile/projects')
  @ApiAuth()
  @ApiOperation({
    summary:
      "Create a portfolio project for the current user's company profile",
  })
  @ApiBody({ type: CreateProjectDto })
  @ApiCommonErrors()
  async createProject(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateProjectDto,
  ) {
    return this.profileService.createProject(reqUser.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile/projects')
  @ApiAuth()
  @ApiOperation({
    summary: "List the current user's company portfolio projects",
  })
  @ApiCommonErrors()
  async listMyProjects(@CurrentUser() reqUser: RequestUser) {
    return this.profileService.listMyProjects(reqUser.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('profile/projects/:id')
  @ApiAuth()
  @ApiOperation({
    summary: "Delete one of the current user's company portfolio projects",
  })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiCommonErrors()
  async deleteMyProject(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
  ) {
    return this.profileService.deleteMyProject(reqUser.userId, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('profile/invoices')
  @ApiAuth()
  @ApiOperation({
    summary: "Create a customer invoice for the current user's company profile",
  })
  @ApiBody({ type: CreateCompanyInvoiceDto })
  @ApiCommonErrors()
  async createInvoice(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateCompanyInvoiceDto,
  ) {
    return this.profileService.createInvoice(reqUser.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile/invoices')
  @ApiAuth()
  @ApiOperation({
    summary: "List the current user's company customer invoices",
  })
  @ApiCommonErrors()
  async listInvoices(@CurrentUser() reqUser: RequestUser) {
    return this.profileService.listInvoices(reqUser.userId);
  }
}
