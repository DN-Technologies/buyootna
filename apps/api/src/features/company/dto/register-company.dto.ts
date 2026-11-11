import { Transform } from 'class-transformer';
import {
  IsIn,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { trim } from '../../../core/validators/trim.transform';
import { ABOUT_MAX_LENGTH } from '../../../common/utils/location.util';

export class RegisterCompanyDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  services?: string;

  @IsString()
  @IsOptional()
  hqLocation?: string;

  @IsString()
  @IsOptional()
  serviceAreas?: string;

  @IsString()
  @IsOptional()
  @MaxLength(ABOUT_MAX_LENGTH, {
    message: 'النبذة يجب ألا تتجاوز ' + ABOUT_MAX_LENGTH + ' حرف',
  })
  about?: string;

  // Older app builds still send it; newer ones send specialty instead
  @IsString()
  @IsOptional()
  licenseActivity?: string;

  // «التخصص»: the services catalogue's مجال التخصص (required by the
  // service; older builds fall back to licenseActivity)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  specialty?: string;

  // The licence comes with «طلب التوثيق» now; older builds still send it
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  licenseExpiry?: string;
  // «verification: email» from apps that enter the emailed code next. Older
  // ones don't send it and are told to update: the account is created only
  // after the code (QA)
  @IsOptional()
  @IsIn(['email'])
  verification?: string;
}
