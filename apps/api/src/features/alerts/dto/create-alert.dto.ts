import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { AlertType } from '@prisma/client';

export class CreateAlertDto {
  @IsEnum(AlertType, { message: 'نوع التنبيه غير صالح' })
  type: AlertType;

  @IsString()
  @IsNotEmpty({ message: 'المحافظة مطلوبة' })
  governorateId: string;

  @IsOptional()
  @IsString()
  areaId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  // --- PROPERTIES-only fields ---

  @ValidateIf((o: CreateAlertDto) => o.type === AlertType.PROPERTIES)
  @IsIn(['SALE', 'RENT', 'EXCHANGE'], { message: 'نوع العملية غير صالح' })
  operationType?: string;

  @ValidateIf((o: CreateAlertDto) => o.type === AlertType.PROPERTIES)
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'السعر يجب أن يكون رقماً' })
  price?: number;

  @ValidateIf((o: CreateAlertDto) => o.type === AlertType.PROPERTIES)
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'قيمة الإيجار يجب أن تكون رقماً' })
  rentValue?: number;

  @ValidateIf((o: CreateAlertDto) => o.type === AlertType.PROPERTIES)
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'المساحة يجب أن تكون رقماً' })
  areaSize?: number;

  @ValidateIf(
    (o: CreateAlertDto) =>
      o.type === AlertType.PROPERTIES && o.operationType === 'EXCHANGE',
  )
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'عدد الغرف يجب أن يكون رقماً صحيحاً' })
  rooms?: number;

  @ValidateIf(
    (o: CreateAlertDto) =>
      o.type === AlertType.PROPERTIES && o.operationType === 'EXCHANGE',
  )
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'عدد الحمامات يجب أن يكون رقماً صحيحاً' })
  baths?: number;

  @ValidateIf(
    (o: CreateAlertDto) =>
      o.type === AlertType.PROPERTIES && o.operationType === 'EXCHANGE',
  )
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'عدد الطوابق يجب أن يكون رقماً صحيحاً' })
  floors?: number;

  @ValidateIf(
    (o: CreateAlertDto) =>
      o.type === AlertType.PROPERTIES && o.operationType === 'EXCHANGE',
  )
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'سنة الطلب يجب أن تكون رقماً صحيحاً' })
  requestYear?: number;

  @ValidateIf(
    (o: CreateAlertDto) =>
      o.type === AlertType.PROPERTIES && o.operationType === 'EXCHANGE',
  )
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'السنة المطلوبة يجب أن تكون رقماً صحيحاً' })
  requiredYear?: number;

  @ValidateIf((o: CreateAlertDto) => o.type === AlertType.PROPERTIES)
  @IsOptional()
  @IsArray({ message: 'يجب أن تكون المرافق في شكل قائمة' })
  @IsString({ each: true, message: 'يجب أن يكون اسم المرفق نصاً' })
  amenities?: string[];

  // --- AUCTIONS-only fields ---

  @ValidateIf((o: CreateAlertDto) => o.type === AlertType.AUCTIONS)
  @IsOptional()
  @IsDateString({}, { message: 'تاريخ البدء غير صالح' })
  startDate?: string;

  @ValidateIf((o: CreateAlertDto) => o.type === AlertType.AUCTIONS)
  @IsOptional()
  @IsDateString({}, { message: 'تاريخ الانتهاء غير صالح' })
  endDate?: string;
}
