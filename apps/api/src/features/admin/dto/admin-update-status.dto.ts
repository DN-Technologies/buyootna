import { IsEnum } from 'class-validator';

export enum UserAccountStatusAction {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  SUSPENDED = 'suspended',
}

export class AdminUpdateStatusDto {
  @IsEnum(UserAccountStatusAction)
  status!: UserAccountStatusAction;
}
