import { IsInt, IsString, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'ID пользователя, которому оставляется отзыв', example: 1 })
  @IsInt()
  revieweeId: number;

  @ApiProperty({ description: 'Оценка пользователя (от 1 до 5)', example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Текстовый комментарий', example: 'Отличный игрок!' })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({ description: 'Публичность отзыва', default: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}