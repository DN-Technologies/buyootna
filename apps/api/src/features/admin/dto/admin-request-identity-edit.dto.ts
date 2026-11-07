import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { VerificationIssuesDto } from '../../identities/verification/company-verification.dto';

export class AdminRequestIdentityEditDto {
  // A general note; required unless `issues` names a field
  @IsOptional()
  @IsString()
  notes?: string;

  // A company's «طلب التوثيق»: the reason per field it must fix
  @IsOptional()
  @ValidateNested()
  @Type(() => VerificationIssuesDto)
  issues?: VerificationIssuesDto;

  @IsOptional()
  @IsBoolean()
  notifyEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyInApp?: boolean;
}
