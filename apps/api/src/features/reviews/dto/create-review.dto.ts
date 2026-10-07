import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  // Optional: a rating can be just the stars
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
