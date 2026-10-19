import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import type { CompletedVia } from '../company-requests.service';

export class CompleteRequestDto {
  @ApiProperty({
    enum: ['in_app', 'outside'],
    description: 'أين تم الاتفاق النهائي: through the app or outside it',
  })
  @IsIn(['in_app', 'outside'])
  via: CompletedVia;
}
