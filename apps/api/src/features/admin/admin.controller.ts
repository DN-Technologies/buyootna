import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminUsersFilterDto } from './dto/admin-users-filter.dto';
import { AdminUpdateStatusDto } from './dto/admin-update-status.dto';
import { AdminUpdateIdentityStatusDto } from './dto/admin-update-identity-status.dto';
import { AdminGuard } from './guards/admin.guard';
import { ApiAuth } from '../../core/swagger/api-auth.decorator';
import { ApiCommonErrors } from '../../core/swagger/api-common-errors.decorator';
import { ApiErrorResponseDto } from '../../core/swagger/api-error-response.dto';
import {
  AdminDeleteUserResponseDto,
  AdminUpdateIdentityStatusResponseDto,
  AdminUpdateUserStatusResponseDto,
  AdminUsersListResponseDto,
} from './dto/admin-response.dto';

@ApiTags('Admin')
@ApiAuth()
@ApiForbiddenResponse({
  description: 'Admin access required',
  type: ApiErrorResponseDto,
})
@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List users, paginated/filterable, with account stats and counts' })
  @ApiResponse({ status: 200, type: AdminUsersListResponseDto })
  @ApiCommonErrors()
  async getUsers(@Query() filters: AdminUsersFilterDto) {
    return this.adminService.getUsers(filters);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get full details for a single user, including identities' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, schema: { type: 'object', additionalProperties: true } })
  @ApiCommonErrors()
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: "Update a user's account status (active/blocked/suspended)" })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, type: AdminUpdateUserStatusResponseDto })
  @ApiCommonErrors()
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: AdminUpdateStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Permanently delete a user account' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, type: AdminDeleteUserResponseDto })
  @ApiCommonErrors()
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Patch('identities/:id/status')
  @ApiOperation({ summary: "Update an identity's approval status (e.g. company/office verification)" })
  @ApiParam({ name: 'id', description: 'Identity ID' })
  @ApiResponse({ status: 200, type: AdminUpdateIdentityStatusResponseDto })
  @ApiCommonErrors()
  async updateIdentityStatus(
    @Param('id') id: string,
    @Body() dto: AdminUpdateIdentityStatusDto,
  ) {
    return this.adminService.updateIdentityStatus(id, dto);
  }
}
