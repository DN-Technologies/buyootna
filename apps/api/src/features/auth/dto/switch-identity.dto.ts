import { IsNotEmpty, IsString } from 'class-validator';

export class SwitchIdentityDto {
  @IsString()
  @IsNotEmpty()
  identityId: string;
}
