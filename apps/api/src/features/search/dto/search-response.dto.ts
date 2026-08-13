import { ApiProperty } from '@nestjs/swagger';

class SearchMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class AdvancedSearchResponseDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'object' },
    description:
      'Result cards, shape depends on the request "tab" (property card, company card, auction card, or deal card)',
  })
  data: Record<string, unknown>[];

  @ApiProperty({ type: SearchMetaDto })
  meta: SearchMetaDto;
}

export class GlobalSearchResponseDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'object' },
    description: 'Mixed result cards (properties, companies, auctions, deals)',
  })
  data: Record<string, unknown>[];

  @ApiProperty({ type: SearchMetaDto })
  meta: SearchMetaDto;
}
