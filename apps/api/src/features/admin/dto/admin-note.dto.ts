import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminCreateNoteDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}

export class AdminUpdateNoteDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}
