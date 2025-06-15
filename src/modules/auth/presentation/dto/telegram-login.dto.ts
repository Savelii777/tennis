import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class TelegramLoginDto {
  @ApiProperty({ description: 'Telegram user ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Telegram hash for verification' })
  @IsString()
  @IsNotEmpty()
  hash: string;

  @ApiPropertyOptional({ description: 'Username' })
  @IsString()
  username?: string;

  @ApiProperty({ description: 'First name' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ description: 'Photo URL' })
  @IsString()
  photo_url?: string;

  @ApiPropertyOptional({ description: 'Authorization date' })
  @IsString()
  auth_date?: string;

  @ApiPropertyOptional({ description: 'Referral code from deep link' })
  @IsString()
  ref?: string; // ← Добавить поддержку реферального кода
}