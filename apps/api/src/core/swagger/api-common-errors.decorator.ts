import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponseDto } from './api-error-response.dto';

/**
 * Standard error responses shared by every endpoint, matching
 * HttpExceptionFilter's { statusCode, message, error } shape.
 */
export function ApiCommonErrors() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Validation failed',
      type: ApiErrorResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Missing or invalid authentication',
      type: ApiErrorResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Not allowed to perform this action',
      type: ApiErrorResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Resource not found',
      type: ApiErrorResponseDto,
    }),
  );
}
