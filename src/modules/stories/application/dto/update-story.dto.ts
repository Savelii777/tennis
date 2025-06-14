import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { StoryStatus } from '../../domain/enums/story-status.enum';

export class UpdateStoryDto {
  @ApiPropertyOptional({ enum: StoryStatus })
  @IsEnum(StoryStatus)
  @IsOptional()
  status?: StoryStatus;
}