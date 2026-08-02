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
import { AdminService } from './admin.service';
import { AdminUsersFilterDto } from './dto/admin-users-filter.dto';
import { AdminUpdateStatusDto } from './dto/admin-update-status.dto';
import { AdminUpdateIdentityStatusDto } from './dto/admin-update-identity-status.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getUsers(@Query() filters: AdminUsersFilterDto) {
    return this.adminService.getUsers(filters);
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: AdminUpdateStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, dto);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Patch('identities/:id/status')
  async updateIdentityStatus(
    @Param('id') id: string,
    @Body() dto: AdminUpdateIdentityStatusDto,
  ) {
    return this.adminService.updateIdentityStatus(id, dto);
  }
}
