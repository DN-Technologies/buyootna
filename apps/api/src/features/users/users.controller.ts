import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
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
import { RegisterIndividualDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import {
  FindUserResponseDto,
  MeResponseDto,
  RegisterIndividualResponseDto,
  SimpleMessageResponseDto,
  UpdateProfileResponseDto,
  UserSafeDto,
} from './dto/user-response.dto';
import { OtpRequestRateLimit } from '../../core/decorators/otp-rate-limit.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly registrationService: UsersRegistrationService,
    private readonly profileService: UsersProfileService,
  ) {}

  @Post('register/individual')
  @OtpRequestRateLimit('identifier')
  @ApiOperation({ summary: 'Register a new individual user account' })
  @ApiResponse({ status: 201, type: RegisterIndividualResponseDto })
  @ApiCommonErrors()
  async registerIndividual(@Body() dto: RegisterIndividualDto) {
    return this.registrationService.registerIndividual(dto);
  }

  // register/company, companies, company/:id now live in CompanyController;
  // register/office, offices, office/:id now live in OfficeController
  // (features/company, features/office) -- kept on the same `users` route
  // prefix via a separate controller class per account type, rather than
  // here.

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

  // profile/projects and profile/invoices (create + list) now live in
  // CompanyController -- company-only, moved alongside the rest of the
  // company-specific account endpoints.

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
