import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminRequestIdentityEditDto {
  @IsNotEmpty()
  @IsString()
  notes!: string;

  @IsOptional()
  @IsBoolean()
  notifyEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyInApp?: boolean;
}
