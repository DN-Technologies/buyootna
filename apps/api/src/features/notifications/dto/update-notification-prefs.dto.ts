import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPrefsDto {
  @IsBoolean()
  @IsOptional()
  appEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  phoneEnabled?: boolean;
}
