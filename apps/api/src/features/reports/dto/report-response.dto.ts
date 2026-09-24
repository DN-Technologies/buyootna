import { ApiProperty } from '@nestjs/swagger';

export class CreateReportResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  data: Record<string, unknown>;
}
