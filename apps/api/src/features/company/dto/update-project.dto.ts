import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { CreateProjectDto } from './create-project.dto';

/** تعديل المشروع: any of its fields, and حالة ظهور المشروع. */
export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({
    description:
      'Hide the project from the public profile (kept on your own list)',
  })
  @IsOptional()
  @IsBoolean({ message: 'حالة الظهور يجب أن تكون قيمة منطقية' })
  isHidden?: boolean;
}

/** اخفاء / اظهار جميع المشاريع. */
export class SetProjectsVisibilityDto {
  @ApiPropertyOptional({
    description: 'true hides every project, false shows them all',
  })
  @IsBoolean({ message: 'حالة الظهور يجب أن تكون قيمة منطقية' })
  isHidden: boolean;
}
