import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @IsBoolean()
  @IsOptional()
  showPhone?: boolean;

  @IsBoolean()
  @IsOptional()
  showWhatsapp?: boolean;

  @IsBoolean()
  @IsOptional()
  hideActivity?: boolean;

  @IsBoolean()
  @IsOptional()
  hideOfficeAds?: boolean;
}
