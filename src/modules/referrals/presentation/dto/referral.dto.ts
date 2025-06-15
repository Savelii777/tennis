import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class GenerateInviteDto {
  @ApiPropertyOptional({ 
    description: 'Базовый URL для генерации ссылки',
    example: 'https://yourapp.com'
  })
  @IsOptional()
  @IsUrl()
  baseUrl?: string;
}

export class RegisterByReferralDto {
  @ApiProperty({ 
    description: 'Реферальный код пригласившего',
    example: 'ABC123XY'
  })
  @IsString()
  referralCode: string;

  @ApiProperty({ 
    description: 'Telegram ID нового пользователя',
    example: '123456789'
  })
  @IsString()
  telegram_id: string;

  @ApiProperty({ 
    description: 'Username пользователя',
    example: 'newuser'
  })
  @IsString()
  username: string;

  @ApiProperty({ 
    description: 'Имя пользователя',
    example: 'Новый'
  })
  @IsString()
  first_name: string;

  @ApiPropertyOptional({ 
    description: 'Фамилия пользователя',
    example: 'Пользователь'
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ 
    description: 'URL фото профиля',
    example: 'https://example.com/photo.jpg'
  })
  @IsOptional()
  @IsUrl()
  photo_url?: string;

  @ApiPropertyOptional({ 
    description: 'Источник перехода',
    example: 'telegram'
  })
  @IsOptional()
  @IsString()
  source?: string;
}