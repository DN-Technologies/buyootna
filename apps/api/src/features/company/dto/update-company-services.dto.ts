import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { trim } from '../../../core/validators/trim.transform';

export class ServiceVisibilityDto {
  @IsUUID()
  id: string;

  @IsBoolean({ message: 'حالة الظهور يجب أن تكون قيمة منطقية' })
  isHidden: boolean;
}

export class SetServiceHiddenDto {
  @ApiPropertyOptional({
    description: 'Hide this sub-service from the profile',
  })
  @IsBoolean({ message: 'حالة الظهور يجب أن تكون قيمة منطقية' })
  isHidden: boolean;
}

/** تعديل الخدمة: what the save sends; only the fields present change. */
export class UpdateCompanyServicesDto {
  @ApiPropertyOptional({
    description: 'Hide the whole service from the profile, cards and search',
  })
  @IsOptional()
  @IsBoolean({ message: 'حالة الظهور يجب أن تكون قيمة منطقية' })
  servicesHidden?: boolean;

  @ApiPropertyOptional({
    description: 'الوصف, up to 100 characters (empty clears it)',
  })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100, { message: 'الوصف يجب ألا يتجاوز 100 حرف' })
  description?: string;

  @ApiPropertyOptional({
    type: [ServiceVisibilityDto],
    description: 'Sub-services to hide or show',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => ServiceVisibilityDto)
  rows?: ServiceVisibilityDto[];
}
