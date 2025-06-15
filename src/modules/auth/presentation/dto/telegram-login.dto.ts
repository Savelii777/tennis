import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TelegramLoginDto {
  @ApiProperty({ 
    description: 'Telegram user ID',
    example: '123456789'
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ 
    description: 'Telegram hash for verification',
    example: 'test_hash_for_development'
  })
  @IsString()
  @IsNotEmpty()
  hash: string;

  @ApiPropertyOptional({ 
    description: 'Username',
    example: 'testuser'
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ 
    description: 'First name',
    example: 'Test'
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiPropertyOptional({ 
    description: 'Last name',
    example: 'User'
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ 
    description: 'Photo URL',
    example: 'https://example.com/photo.jpg'
  })
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiPropertyOptional({ 
    description: 'Authorization date',
    example: '1654837742'
  })
  @IsOptional()
  @IsString()
  auth_date?: string;

  @ApiPropertyOptional({ 
    description: 'Реферальный код (необязательный)',
    example: 'REF123ABC',
    required: false
  })
  @IsOptional()
  @IsString()
  ref?: string;
}