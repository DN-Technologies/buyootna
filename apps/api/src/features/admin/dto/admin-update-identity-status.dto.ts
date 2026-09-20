import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class AdminUpdateIdentityStatusDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status!: 'APPROVED' | 'REJECTED';

  // Only meaningful for REJECTED -- stored as a ReviewRequest note when present.
  @IsOptional()
  @IsString()
  reason?: string;

  // Both default to true (matching the review modals' default-checked
  // notify checkboxes) when omitted.
  @IsOptional()
  @IsBoolean()
  notifyEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyInApp?: boolean;
}
