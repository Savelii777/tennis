import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsInt, IsIn, IsNumber, Min, Max } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ description: 'Язык интерфейса', enum: ['ru', 'en'] })
  @IsOptional()
  @IsString()
  @IsIn(['ru', 'en'])
  language?: string;

  @ApiPropertyOptional({ description: 'ID города' })
  @IsOptional()
  @IsInt()
  cityId?: number;

  @ApiPropertyOptional({ description: 'ID вида спорта' })
  @IsOptional()
  @IsInt()
  sportId?: number;

  @ApiPropertyOptional({ description: 'Включить все уведомления' })
  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Telegram уведомления' })
  @IsOptional()
  @IsBoolean()
  notifyTelegram?: boolean;

  @ApiPropertyOptional({ description: 'Email уведомления' })
  @IsOptional()
  @IsBoolean()
  notifyEmail?: boolean;

  @ApiPropertyOptional({ description: 'Время напоминания о матчах', enum: ['1h', '1d', 'off'] })
  @IsOptional()
  @IsString()
  @IsIn(['1h', '1d', 'off'])
  matchReminderTime?: string;

  @ApiPropertyOptional({ description: 'Уведомления о результатах матчей' })
  @IsOptional()
  @IsBoolean()
  notifyMatchResults?: boolean;

  @ApiPropertyOptional({ description: 'Уведомления о результатах турниров' })
  @IsOptional()
  @IsBoolean()
  notifyTournamentResults?: boolean;

  @ApiPropertyOptional({ description: 'Показывать профиль публично' })
  @IsOptional()
  @IsBoolean()
  showProfilePublicly?: boolean;

  @ApiPropertyOptional({ description: 'Показывать рейтинг публично' })
  @IsOptional()
  @IsBoolean()
  showRatingPublicly?: boolean;

  @ApiPropertyOptional({ description: 'Разрешить приглашения на матчи' })
  @IsOptional()
  @IsBoolean()
  allowMatchInvites?: boolean;

  @ApiPropertyOptional({ description: 'Требовать подтверждение матчей' })
  @IsOptional()
  @IsBoolean()
  requireMatchConfirm?: boolean;

  @ApiPropertyOptional({ description: 'Предпочитаемый пол соперников', enum: ['male', 'female', 'any'] })
  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'any'])
  preferredGender?: string;

  @ApiPropertyOptional({ description: 'Минимальный возраст соперников' })
  @IsOptional()
  @IsInt()
  @Min(16)
  @Max(80)
  preferredAgeMin?: number;

  @ApiPropertyOptional({ description: 'Максимальный возраст соперников' })
  @IsOptional()
  @IsInt()
  @Min(16)
  @Max(80)
  preferredAgeMax?: number;

  @ApiPropertyOptional({ description: 'Минимальный уровень NTRP соперников' })
  @IsOptional()
  @IsNumber()
  @Min(2.0)
  @Max(7.0)
  preferredLevelMin?: number;

  @ApiPropertyOptional({ description: 'Максимальный уровень NTRP соперников' })
  @IsOptional()
  @IsNumber()
  @Min(2.0)
  @Max(7.0)
  preferredLevelMax?: number;

  @ApiPropertyOptional({ description: 'Цветовая схема', enum: ['light', 'dark', 'auto'] })
  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark', 'auto'])
  theme?: string;

  @ApiPropertyOptional({ description: 'Часовой пояс' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Telegram Chat ID' })
  @IsOptional()
  @IsString()
  telegramChatId?: string;
}

export class LanguageDto {
  @ApiProperty({ description: 'Язык интерфейса', enum: ['ru', 'en'] })
  @IsString()
  @IsIn(['ru', 'en'])
  language: string;
}

export class NotificationSettingsDto {
  @ApiProperty({ description: 'Включить все уведомления' })
  @IsBoolean()
  notificationsEnabled: boolean;

  @ApiPropertyOptional({ description: 'Telegram уведомления' })
  @IsOptional()
  @IsBoolean()
  notifyTelegram?: boolean;

  @ApiPropertyOptional({ description: 'Email уведомления' })
  @IsOptional()
  @IsBoolean()
  notifyEmail?: boolean;

  @ApiPropertyOptional({ description: 'Время напоминания о матчах', enum: ['1h', '1d', 'off'] })
  @IsOptional()
  @IsString()
  @IsIn(['1h', '1d', 'off'])
  matchReminderTime?: string;
}