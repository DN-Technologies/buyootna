import { IsOptional, IsString } from 'class-validator';

export class CreateIndividualIdentityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
