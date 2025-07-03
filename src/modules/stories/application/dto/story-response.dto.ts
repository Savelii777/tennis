import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StoryUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Иван' })
  firstName: string;

  @ApiPropertyOptional({ example: 'Иванов' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'ivanov123' })
  username?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatar?: string;
}

export class StoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiPropertyOptional()
  user?: StoryUserDto;

  @ApiProperty({ example: 'IMAGE', enum: ['IMAGE', 'VIDEO'] })
  type: string;

  @ApiProperty({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status: string;

  @ApiPropertyOptional({ example: 'Великолепный матч!' })
  caption?: string;

  @ApiProperty({ example: 0 })
  viewsCount: number;

  @ApiProperty({ example: 0 })
  likesCount: number;

  @ApiProperty({ example: '2023-01-01T12:00:00Z' })
  createdAt: Date;

  @ApiPropertyOptional({ example: '2023-01-01T14:00:00Z' })
  publishedAt?: Date;

  @ApiPropertyOptional({ example: '/stories/1/file' })
  fileUrl?: string;
}