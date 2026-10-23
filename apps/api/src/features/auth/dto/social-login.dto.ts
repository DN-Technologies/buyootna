import { IsNotEmpty, IsString } from 'class-validator';

import { TermsAcceptanceDto } from './terms-acceptance.dto';

export class GoogleLoginDto extends TermsAcceptanceDto {
  @IsString()
  @IsNotEmpty({ message: 'idToken مطلوب' })
  idToken: string;
}

export class AppleLoginDto extends TermsAcceptanceDto {
  @IsString()
  @IsNotEmpty({ message: 'identityToken مطلوب' })
  identityToken: string;
}
