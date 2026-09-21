import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import { GetOfficesFilterDto } from './dto/get-offices-filter.dto';
import { RegisterOfficeDto } from './dto/register-office.dto';
import {
  OfficeDetailsResponseDto,
  OfficeListResponseDto,
  RegisterOfficeResponseDto,
} from './dto/office-response.dto';
import { UsersDirectoryService } from '../users/services/users-directory.service';
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
export class OfficeController {
  constructor(
    private readonly registrationService: UsersRegistrationService,
    private readonly directoryService: UsersDirectoryService,
  ) {}

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
}
