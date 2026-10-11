import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { trim } from '../../../core/validators/trim.transform';

// The type that stands for "none of the listed ones": it needs a title
export const OTHER_SERVICE_TYPE = 'اخرى';

export class CreateCompanyServiceDto {
  @ApiProperty({ example: 'مكتب هندسي', description: 'التخصص' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'التخصص مطلوب' })
  @MaxLength(60, { message: 'التخصص يجب ألا يتجاوز 60 حرفاً' })
  specialty: string;

  @ApiProperty({
    example: ['مخطط معماري (المساقط)', 'تصميم الواجهات'],
    description: 'نوع الخدمة: one row is created per type',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'يجب اختيار نوع خدمة واحد على الأقل' })
  @ArrayMaxSize(40, { message: 'عدد أنواع الخدمة كبير جداً' })
  @ArrayUnique({ message: 'لا يمكن تكرار نوع الخدمة' })
  @IsString({ each: true })
  @IsNotEmpty({ each: true, message: 'نوع الخدمة غير صالح' })
  @MaxLength(60, { each: true, message: 'نوع الخدمة يجب ألا يتجاوز 60 حرفاً' })
  types: string[];

  @ApiPropertyOptional({
    example: 'تصميم حدائق',
    description: 'عنوان الخدمة: required when types includes "اخرى"',
  })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100, { message: 'عنوان الخدمة يجب ألا يتجاوز 100 حرف' })
  title?: string;

  @ApiPropertyOptional({ description: 'الوصف, up to 100 characters' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100, { message: 'الوصف يجب ألا يتجاوز 100 حرف' })
  description?: string;
}
