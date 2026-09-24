import { ApiProperty } from '@nestjs/swagger';

export class AdminModeratorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  email: string | null;
}
