import { IsOptional, IsString } from 'class-validator';

export class AdminRemovePropertyDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
