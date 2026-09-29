import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AdminChangePlanDto {
  @IsString()
  planId: string;

  // The persona receiving the credits; defaults to the account's
  // individual persona, else its earliest
  @IsOptional()
  @IsString()
  identityId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  adsRemaining?: number;
}
