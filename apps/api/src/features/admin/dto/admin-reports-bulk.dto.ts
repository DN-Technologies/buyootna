import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AdminReportsBulkDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids!: string[];
}
