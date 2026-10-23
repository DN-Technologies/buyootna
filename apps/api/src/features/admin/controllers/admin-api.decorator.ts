import { applyDecorators, Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';

import { ApiAuth } from '../../../core/swagger/api-auth.decorator';
import { ApiErrorResponseDto } from '../../../core/swagger/api-error-response.dto';
import { AdminGuard } from '../guards/admin.guard';

/**
 * Every admin controller: mounted under /admin, admins only (a signed-in
 * account with isAdmin), one "Admin" section in Swagger. Keep new admin
 * controllers on this so none is left without the guard.
 */
export function AdminApi() {
  return applyDecorators(
    ApiTags('Admin'),
    ApiAuth(),
    ApiForbiddenResponse({
      description: 'Admin access required',
      type: ApiErrorResponseDto,
    }),
    Controller('admin'),
    UseGuards(AuthGuard('jwt'), AdminGuard),
  );
}
