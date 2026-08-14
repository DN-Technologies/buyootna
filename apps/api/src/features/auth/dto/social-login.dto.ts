import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'idToken مطلوب' })
  idToken: string;
}

export class AppleLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'identityToken مطلوب' })
  identityToken: string;
}
