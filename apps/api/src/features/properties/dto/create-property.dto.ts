import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ListingType, PropertyCategory } from '@prisma/client';

export class CreatePropertyDto {
  @IsEnum(ListingType, { message: 'نوع الإعلان غير صالح' })
  type: ListingType;

  @IsEnum(PropertyCategory, { message: 'فئة العقار غير صالحة' })
  category: PropertyCategory;

  @Type(() => Number)
  @IsNumber({}, { message: 'السعر يجب أن يكون رقماً' })
  price: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'المساحة يجب أن تكون رقماً' })
  area: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'عدد الغرف يجب أن يكون رقماً' })
  beds: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'عدد الحمامات يجب أن يكون رقماً' })
  baths: number;

  @IsString()
  @IsNotEmpty({ message: 'الموقع مطلوب' })
  location: string;

  @IsString()
  @IsNotEmpty({ message: 'الوصف مطلوب' })
  description: string;
}
