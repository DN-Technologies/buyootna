import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ListingType, PropertyCategory, PropertyStatus } from '@prisma/client';
import { AddressDetailsDto } from '../../../core/dto/address-details.dto';

export class CreatePropertyDto {
  @IsBoolean({ message: 'حالة المسودة يجب أن تكون قيمة منطقية' })
  isDraft: boolean;

  @IsOptional()
  @IsString()
  planSlotId?: string;

  // One per publish attempt: repeating a request with the same key returns
  // the ad already created instead of spending the package again
  @IsOptional()
  @IsUUID('4', { message: 'مفتاح الإرسال غير صالح' })
  submissionKey?: string;

  @IsEnum(ListingType, { message: 'نوع الإعلان غير صالح' })
  type: ListingType;

  @IsEnum(PropertyCategory, { message: 'فئة العقار غير صالحة' })
  category: PropertyCategory;

  @Type(() => Number)
  @IsNumber({}, { message: 'المساحة يجب أن تكون رقماً' })
  areaSize: number;

  // Rooms and baths are omitted for categories that have none (land, farm);
  // see property-category-fields.ts
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'عدد الغرف يجب أن يكون رقماً' })
  beds?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'عدد الحمامات يجب أن يكون رقماً' })
  baths?: number;

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

  // القطعة / الشارع / الجادة / المنزل / علامة مميزة from the location picker
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDetailsDto)
  addressDetails?: AddressDetailsDto;

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

  // Price is optional -- omitted when the "Add Price" toggle is off
  // (price upon request / negotiable / hidden). When provided, it must
  // be numeric.
  @IsOptional()
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

  // --- 5. Additional Listing Details ---

  @IsOptional()
  @IsBoolean({ message: 'حالة الإعلان المميز يجب أن تكون قيمة منطقية' })
  isFeatured?: boolean;

  @IsOptional()
  @IsString({ message: 'رقم الهاتف يجب أن يكون نصاً' })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: 'رقم الواتساب يجب أن يكون نصاً' })
  whatsappNumber?: string;

  @ValidateIf((o: CreatePropertyDto) => o.type === ListingType.EXCHANGE)
  @IsOptional()
  @IsString({ message: 'حالة التخصيص يجب أن تكون نصاً' })
  allocationStatus?: string;

  @IsOptional()
  @IsString({ message: 'الرقم الآلي يجب أن يكون نصاً' })
  automatedNumber?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'عدد الأدوار يجب أن يكون رقماً' })
  floors?: number;

  @IsOptional()
  @IsArray({ message: 'المزايا يجب أن تكون في شكل قائمة' })
  features?: Record<string, string>[];

  @IsOptional()
  @IsString({ message: 'معرّف المحافظة يجب أن يكون نصاً' })
  governorateId?: string;

  @IsOptional()
  @IsString({ message: 'معرّف المنطقة يجب أن يكون نصاً' })
  areaId?: string;

  // Rent-specific text fields
  @ValidateIf((o: CreatePropertyDto) => o.type === ListingType.RENT)
  @IsOptional()
  @IsString({ message: 'المصاريف الإضافية يجب أن تكون نصاً' })
  additionalExpenses?: string;

  @ValidateIf((o: CreatePropertyDto) => o.type === ListingType.RENT)
  @IsOptional()
  @IsString({ message: 'شروط الإيجار يجب أن تكون نصاً' })
  rentConditions?: string;
}
