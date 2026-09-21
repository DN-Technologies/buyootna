import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsEmailOrPhone } from '../../../core/validators/is-email-or-phone.validator';
import { NAME_REGEX, NAME_REGEX_MESSAGE } from '../../../core/validators/name.regex';
import { trim } from '../../../core/validators/trim.transform';

export class RegisterIndividualDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'الاسم مطلوب' })
  @MinLength(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' })
  @MaxLength(32, { message: 'الاسم يجب ألا يتجاوز 32 حرفاً' })
  @Matches(NAME_REGEX, { message: NAME_REGEX_MESSAGE })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  @IsEmailOrPhone({ message: 'أدخل بريد إلكتروني أو رقم هاتف صحيح' })
  identifier: string;

  @IsString()
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password: string;
}

// RegisterCompanyDto / RegisterOfficeDto now live in
// features/company/dto/register-company.dto.ts and
// features/office/dto/register-office.dto.ts.
