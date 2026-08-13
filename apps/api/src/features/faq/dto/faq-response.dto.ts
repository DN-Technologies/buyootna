import { ApiProperty } from '@nestjs/swagger';

export class FaqItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  question: string;

  @ApiProperty()
  answer: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
