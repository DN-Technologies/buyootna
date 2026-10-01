import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { trim } from '../../../core/validators/trim.transform';

export class CreateInvoiceItemDto {
  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'اسم البند مطلوب' })
  @MaxLength(100, { message: 'اسم البند يجب ألا يتجاوز 100 حرف' })
  name: string;

  @IsNumber({}, { message: 'السعر غير صالح' })
  @Min(0, { message: 'السعر يجب أن يكون أكبر من صفر' })
  price: number;

  @IsInt({ message: 'الكمية غير صالحة' })
  @Min(1, { message: 'الكمية يجب أن تكون 1 على الأقل' })
  qty: number;
}

export class CreateCompanyInvoiceDto {
  // One of the company's accepted requests: the invoice goes to that
  // client's account (فواتير الخدمات) and their name is used
  @IsOptional()
  @IsUUID('4', { message: 'الطلب غير صالح' })
  requestId?: string;

  // A client outside the app, by name; required (by the service) only
  // without requestId
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'اسم العميل مطلوب' })
  @MinLength(1, { message: 'اسم العميل مطلوب' })
  @MaxLength(100, { message: 'اسم العميل يجب ألا يتجاوز 100 حرف' })
  clientName?: string;

  @Transform(trim)
  @IsString()
  @MinLength(1, { message: 'عنوان الفاتورة مطلوب' })
  @MaxLength(100, { message: 'عنوان الفاتورة يجب ألا يتجاوز 100 حرف' })
  title: string;

  @Transform(trim)
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'كفالة الخدمة يجب ألا تتجاوز 50 حرفاً' })
  warrantyMonths?: string;

  @IsDateString({}, { message: 'تاريخ الاصدار غير صالح' })
  issueDate: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'يجب إضافة بند واحد على الأقل' })
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];

  @IsNumber({}, { message: 'قيمة الخصم غير صالحة' })
  @Min(0, { message: 'قيمة الخصم يجب أن تكون أكبر من صفر' })
  @IsOptional()
  discount?: number;
}
