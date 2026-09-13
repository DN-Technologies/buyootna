import { ApiProperty } from '@nestjs/swagger';

export class AdminUserListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ enum: ['فرد', 'شركة', 'مكتب عقاري'] })
  accountType: string;

  @ApiProperty({ enum: ['موثق', 'غير موثق', 'قيد الانتظار', '—'] })
  verificationStatus: string;

  @ApiProperty()
  subscriptionPlan: string;

  @ApiProperty({
    required: false,
    description: 'Number of ads/properties posted',
    example: 3,
  })
  adsCount?: number;

  @ApiProperty({ enum: ['نشط', 'محظور', 'موقوف'] })
  accountStatus: string;

  @ApiProperty()
  registrationDate: string;
}

class AdminUserListMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

class AdminUserStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  active: number;

  @ApiProperty()
  blocked: number;

  @ApiProperty()
  suspended: number;
}

class AdminUserCountsDto {
  @ApiProperty()
  all: number;

  @ApiProperty()
  individual: number;

  @ApiProperty()
  office: number;

  @ApiProperty()
  company: number;
}

export class AdminUsersListResponseDto {
  @ApiProperty({ type: [AdminUserListItemDto] })
  data: AdminUserListItemDto[];

  @ApiProperty({ type: AdminUserListMetaDto })
  meta: AdminUserListMetaDto;

  @ApiProperty({ type: AdminUserStatsDto })
  stats: AdminUserStatsDto;

  @ApiProperty({ type: AdminUserCountsDto })
  counts: AdminUserCountsDto;
}

export class AdminDeleteUserResponseDto {
  @ApiProperty()
  message: string;
}

export class AdminUpdateUserStatusResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  user: Record<string, unknown>;
}

export class AdminUpdateIdentityStatusResponseDto {
  @ApiProperty()
  message: string;
}
