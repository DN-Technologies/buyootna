import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { trim } from '../../../core/validators/trim.transform';

export class CreateProjectDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'عنوان المشروع مطلوب' })
  @MaxLength(100, { message: 'عنوان المشروع يجب ألا يتجاوز 100 حرف' })
  title: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'الوصف مطلوب' })
  @MaxLength(100, { message: 'الوصف يجب ألا يتجاوز 100 حرف' })
  description: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'يجب إضافة صورة واحدة على الأقل' })
  @ArrayMaxSize(3, { message: 'يمكن إضافة حتى 3 صور' })
  @IsUrl({}, { each: true, message: 'رابط الصورة غير صالح' })
  images: string[];
}
