import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { GetReviewsDto } from '../../reviews/dto/get-reviews.dto';

const IDENTITY_ID_DOC = {
  description:
    "One of the user's identities (فرد / شركة / مكتب): the tab shows that persona's data only. Omitted: today's account-wide (or default persona) answer. Not the user's: 404.",
};

/** `?identityId=` of a user-detail tab: the persona the admin has selected. */
export class AdminIdentityQueryDto {
  @ApiPropertyOptional(IDENTITY_ID_DOC)
  @IsOptional()
  @IsUUID()
  identityId?: string;
}

export class AdminGetReviewsDto extends GetReviewsDto {
  @ApiPropertyOptional(IDENTITY_ID_DOC)
  @IsOptional()
  @IsUUID()
  identityId?: string;
}
