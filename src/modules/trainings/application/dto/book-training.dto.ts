import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BookTrainingDto {
  @ApiPropertyOptional({ description: 'Комментарий к бронированию' })
  @IsString()
  @IsOptional()
  comment?: string;
}