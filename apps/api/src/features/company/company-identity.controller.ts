import {
  Body,
  Controller,
  Post,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { CreateCompanyIdentityDto } from '../identities/dto';
import { IdentityResponseDto } from '../identities/dto/identity-response.dto';
import { IdentitiesService } from '../identities/identities.service';

@ApiTags('Identities')
@ApiAuth()
@Controller('identities')
@UseGuards(AuthGuard('jwt'))
export class CompanyIdentityController {
  constructor(private readonly identitiesService: IdentitiesService) {}

  // POST /identities/company - Create company identity
  @Post('company')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'license', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary:
      'Create a company identity for the current user, with optional logo/license file upload',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: { type: 'string', format: 'binary' },
        license: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, type: IdentityResponseDto })
  @ApiCommonErrors()
  createCompany(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: CreateCompanyIdentityDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      license?: Express.Multer.File[];
    },
  ) {
    const logoFile = files.logo ? files.logo[0] : undefined;
    const licenseFile = files.license ? files.license[0] : undefined;
    return this.identitiesService.createCompany(
      reqUser.userId,
      dto,
      logoFile,
      licenseFile,
    );
  }
}
