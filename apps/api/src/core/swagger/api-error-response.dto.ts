import { ApiProperty } from '@nestjs/swagger';

/**
 * Mirrors the JSON shape produced by HttpExceptionFilter for every error
 * response: { statusCode, message, error }.
 */
export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'Validation failed',
  })
  message: string | string[];

  @ApiProperty({ example: 'BadRequestException' })
  error: string;
}
