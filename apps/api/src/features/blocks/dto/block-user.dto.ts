import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, ValidateIf } from 'class-validator';

/**
 * Who to block: the account, or one of its profiles (a story only knows
 * the author's profile). With both, the profile must be that account's.
 */
export class BlockUserDto {
  @ApiPropertyOptional({ description: 'The account to block' })
  @ValidateIf((o: BlockUserDto) => !o.identityId || o.userId !== undefined)
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description:
      'The profile it was blocked from (a company, office…), shown in the blocked list; enough on its own',
  })
  @IsOptional()
  @IsUUID()
  identityId?: string;
}

export class BlockedAccountDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ enum: ['INDIVIDUAL', 'COMPANY', 'OFFICE'], nullable: true })
  type: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE' | null;

  @ApiProperty()
  blockedAt: string;
}

export class BlockStatusDto {
  @ApiProperty({ description: 'Whether the current account blocked this one' })
  blocked: boolean;
}
