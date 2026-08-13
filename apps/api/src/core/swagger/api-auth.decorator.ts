import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiErrorResponseDto } from './api-error-response.dto';

/**
 * Marks an endpoint (or whole controller) as requiring the JWT bearer token
 * issued by AuthGuard('jwt'). Apply at the same granularity (class vs.
 * method) as the matching @UseGuards(AuthGuard('jwt')).
 */
export function ApiAuth() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid authentication',
      type: ApiErrorResponseDto,
    }),
  );
}
