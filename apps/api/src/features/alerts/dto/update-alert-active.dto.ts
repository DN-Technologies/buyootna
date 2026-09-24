import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateAlertActiveDto {
  @ApiProperty({
    description: 'false pauses the alert; paused alerts never match',
  })
  @IsBoolean({ message: 'حالة التنبيه يجب أن تكون true أو false' })
  isActive: boolean;
}
