import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { ApiAuth } from '../../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../../core/swagger/api-common-errors.decorator';
import type { RequestUser } from '../../auth/strategies/jwt.strategy';
import {
  MyVerificationResponseDto,
  SubmitVerificationDto,
  VerificationRequestResponseDto,
} from './company-verification.dto';
import { CompanyVerificationService } from './company-verification.service';

// «بحد أقصى 10 ميجا لكل ملف»
const LICENSE_UPLOAD = { limits: { fileSize: 10 * 1024 * 1024 } };

const LICENSE_BODY = {
  schema: {
    type: 'object',
    properties: {
      licenseNumber: { type: 'string' },
      licenseActivity: { type: 'string' },
      licenseExpiry: { type: 'string' },
      license: { type: 'string', format: 'binary' },
    },
  },
};

/** «طلب التوثيق» for the signed-in user's company. */
@ApiTags('Identities')
@ApiAuth()
@Controller('identities/:id/verification')
@UseGuards(AuthGuard('jwt'))
export class CompanyVerificationController {
  constructor(private readonly verification: CompanyVerificationService) {}

  @Get()
  @ApiOperation({
    summary: "The company's «موثق» badge and its latest verification request",
  })
  @ApiResponse({ status: 200, type: MyVerificationResponseDto })
  @ApiCommonErrors()
  getMine(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.verification.getMine(user.userId, id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('license', LICENSE_UPLOAD))
  @ApiOperation({
    summary:
      'Send «طلب توثيق»: licence number (required), activity, expiry and the licence image',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(LICENSE_BODY)
  @ApiResponse({ status: 201, type: VerificationRequestResponseDto })
  @ApiCommonErrors()
  submit(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: SubmitVerificationDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.verification.submit(user.userId, id, dto, file);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('license', LICENSE_UPLOAD))
  @ApiOperation({
    summary:
      '«اعادة ارسال الطلب»: send back only the fields the admin asked to fix',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(LICENSE_BODY)
  @ApiResponse({ status: 200, type: VerificationRequestResponseDto })
  @ApiCommonErrors()
  resubmit(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: SubmitVerificationDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.verification.resubmit(user.userId, id, dto, file);
  }
}
