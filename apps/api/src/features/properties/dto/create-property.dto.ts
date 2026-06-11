import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ListingType, PropertyCategory, PropertyStatus } from '@prisma/client';

export class CreatePropertyDto {
  @IsBoolean({ message: 'حالة المسودة يجب أن تكون قيمة منطقية' })
  isDraft: boolean;

  @IsEnum(ListingType, { message: 'نوع الإعلان غير صالح' })
  type: ListingType;

  @IsEnum(PropertyCategory, { message: 'فئة العقار غير صالحة' })
  category: PropertyCategory;

  @Type(() => Number)
  @IsNumber({}, { message: 'المساحة يجب أن تكون رقماً' })
  areaSize: number;

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

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'عمر العقار يجب أن يكون رقماً' })
  propertyAge?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'إحداثيات خط العرض غير صالحة' })
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'إحداثيات خط الطول غير صالحة' })
  longitude?: number;

  @IsArray({ message: 'يجب أن تكون الصور في شكل قائمة' })
  @IsString({ each: true, message: 'يجب أن يكون رابط الصورة نصاً' })
  images: string[];

  // --- 4. Polymorphic Validation (Conditional) ---

  // Price is ONLY required if it's SALE or RENT.
  // If the user selects EXCHANGE, class-validator will completely ignore this field.
  @ValidateIf(
    (o: CreatePropertyDto) =>
      o.type === ListingType.SALE || o.type === ListingType.RENT,
  )
  @Type(() => Number)
  @IsNumber({}, { message: 'السعر يجب أن يكون رقماً' })
  price?: number;

  // Property Income is optional, but only makes sense for SALE
  @ValidateIf((o: CreatePropertyDto) => o.type === ListingType.SALE)
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'مدخول العقار يجب أن يكون رقماً' })
  propertyIncome?: number;

  // Exchange (البدل) Fields
  @ValidateIf((o: CreatePropertyDto) => o.type === ListingType.EXCHANGE)
  @Type(() => Number)
  @IsNumber({}, { message: 'سنة الطلب يجب أن تكون رقماً' })
  requestYear?: number;

  @ValidateIf((o: CreatePropertyDto) => o.type === ListingType.EXCHANGE)
  @Type(() => Number)
  @IsNumber({}, { message: 'السنة المطلوبة يجب أن تكون رقماً' })
  requiredYear?: number;

  @ValidateIf((o: CreatePropertyDto) => o.type === ListingType.EXCHANGE)
  @IsOptional()
  @IsEnum(PropertyStatus, { message: 'حالة التخصيص غير صالحة' })
  exchangeStatus?: PropertyStatus;
}
