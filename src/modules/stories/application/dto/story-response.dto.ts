import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from '../../domain/enums/media-type.enum';
import { StoryStatus } from '../../domain/enums/story-status.enum';

export class StoryResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  telegramFileId: string;

  @ApiProperty({ required: false })
  telegramFilePath?: string;

  @ApiProperty({ enum: MediaType })
  type: MediaType;

  @ApiProperty({ enum: StoryStatus })
  status: StoryStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  publishedAt?: Date;

  @ApiProperty({ required: false })
  fileUrl?: string;

  @ApiProperty({ required: false })
  user?: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}