import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AdminChangePlanDto {
  @IsString()
  planId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  adsRemaining?: number;
}
