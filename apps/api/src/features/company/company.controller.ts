import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { CreateCompanyServiceDto } from './dto/create-company-service.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import {
  SetProjectsVisibilityDto,
  UpdateProjectDto,
} from './dto/update-project.dto';
import { GetCompaniesFilterDto } from './dto/get-companies-filter.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import {
  CompanyDetailsResponseDto,
  CompanyListResponseDto,
  RegisterCompanyResponseDto,
} from './dto/company-response.dto';
import { UsersDirectoryService } from '../users/services/users-directory.service';
import { CompanyServicesService } from '../users/services/company-services.service';
import { UsersProfileService } from '../users/services/users-profile.service';
import { UsersRegistrationService } from '../users/services/users-registration.service';
import { ListServiceInvoicesDto } from '../service-invoices/dto/list-service-invoices.dto';
import { CompanyInvoicesService } from '../service-invoices/services/company-invoices.service';

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
    private readonly companyServices: CompanyServicesService,
    private readonly directoryService: UsersDirectoryService,
    private readonly companyInvoices: CompanyInvoicesService,
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
    // No files at all when the request isn't multipart (e.g. the web portals)
    const logoFile = files?.logo?.[0];
    const licenseFile = files?.license?.[0];

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
  @Post('profile/services')
  @ApiAuth()
  @ApiOperation({
    summary:
      "Add services to the current user's company: one per chosen type. The first one fixes the company's specialty",
  })
  @ApiBody({ type: CreateCompanyServiceDto })
  @ApiCommonErrors()
  async createService(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateCompanyServiceDto,
  ) {
    return this.companyServices.create(reqUser.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile/services')
  @ApiAuth()
  @ApiOperation({
    summary: "List the current user's company services and its specialty",
  })
  @ApiCommonErrors()
  async listMyServices(@CurrentUser() reqUser: RequestUser) {
    return this.companyServices.listMine(reqUser.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('profile/services/:id')
  @ApiAuth()
  @ApiOperation({
    summary: "Delete one of the current user's company services",
  })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiCommonErrors()
  async deleteMyService(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
  ) {
    return this.companyServices.deleteMine(reqUser.userId, id);
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
  @Patch('profile/projects/:id')
  @ApiAuth()
  @ApiOperation({
    summary:
      "Edit one of the current user's portfolio projects: title, description, images, and hidden from the public profile",
  })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiCommonErrors()
  async updateMyProject(
    @CurrentUser() reqUser: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.profileService.updateMyProject(reqUser.userId, id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile/projects')
  @ApiAuth()
  @ApiOperation({
    summary:
      "Hide (or show again) all of the current user's portfolio projects",
  })
  @ApiBody({ type: SetProjectsVisibilityDto })
  @ApiCommonErrors()
  async setAllMyProjectsHidden(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: SetProjectsVisibilityDto,
  ) {
    return this.profileService.setAllMyProjectsHidden(
      reqUser.userId,
      dto.isHidden,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('profile/projects')
  @ApiAuth()
  @ApiOperation({
    summary: "Delete all of the current user's portfolio projects",
  })
  @ApiCommonErrors()
  async deleteAllMyProjects(@CurrentUser() reqUser: RequestUser) {
    return this.profileService.deleteAllMyProjects(reqUser.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('profile/invoices')
  @ApiAuth()
  @ApiOperation({
    summary:
      "Issue a service invoice from the current company persona; with requestId (an accepted request) it reaches that client's فواتير الخدمات",
  })
  @ApiBody({ type: CreateCompanyInvoiceDto })
  @ApiCommonErrors()
  async createInvoice(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateCompanyInvoiceDto,
  ) {
    return this.companyInvoices.create(reqUser.identityId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile/invoices')
  @ApiAuth()
  @ApiOperation({
    summary:
      'Invoices the current company persona issued, searchable (invoice no., service, client) and sorted',
  })
  @ApiCommonErrors()
  async listInvoices(
    @CurrentUser() reqUser: RequestUser,
    @Query() query: ListServiceInvoicesDto,
  ) {
    return this.companyInvoices.list(reqUser.identityId, query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile/invoices/clients')
  @ApiAuth()
  @ApiOperation({
    summary:
      'The clients the current company can invoice: its accepted requests (requestId, title, clientName)',
  })
  @ApiCommonErrors()
  async invoiceableClients(@CurrentUser() reqUser: RequestUser) {
    return this.companyInvoices.invoiceableRequests(reqUser.identityId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile/invoices/:id/paid')
  @ApiAuth()
  @ApiOperation({
    summary:
      "Mark one of the company's invoices paid (sets paidAt and notifies the client)",
  })
  @ApiCommonErrors()
  async markInvoicePaid(
    @CurrentUser() reqUser: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.companyInvoices.markPaid(reqUser.identityId, id);
  }
}
