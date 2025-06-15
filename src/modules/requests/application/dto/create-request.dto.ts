import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsDateString, Min, Max } from 'class-validator';

export enum RequestType {
  GAME = 'GAME',
  TRAINING = 'TRAINING',
  TOURNAMENT = 'TOURNAMENT'
}

export enum GameMode {
  SINGLES = 'SINGLES',
  DOUBLES = 'DOUBLES',
  MIXED = 'MIXED'
}


export class CreateRequestDto {
  @ApiProperty({ description: 'Тип заявки', enum: RequestType })
  @IsEnum(RequestType)
  type: RequestType;

  @ApiProperty({ description: 'Заголовок заявки' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Описание заявки' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Режим игры', enum: GameMode })
  @IsEnum(GameMode)
  gameMode: GameMode;

  @ApiProperty({ description: 'Дата и время игры' })
  @IsDateString()
  dateTime: Date;

  @ApiProperty({ description: 'Место проведения' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ description: 'Максимальное количество игроков' })
  @IsInt()
  @Min(2)
  @Max(10)
  maxPlayers: number;

  // Убираем playerLevel так как его нет в схеме базы данных

  @ApiPropertyOptional({ description: 'Название локации (для совместимости)' })
  @IsString()
  @IsOptional()
  locationName?: string;

  @ApiPropertyOptional({ description: 'Тип оплаты' })
  @IsString()
  @IsOptional()
  paymentType?: string;

  @ApiPropertyOptional({ description: 'Тип рейтинга' })
  @IsString()
  @IsOptional()
  ratingType?: string;

  @ApiPropertyOptional({ description: 'Информация о формате (включая уровень)' })
  @IsOptional()
  formatInfo?: any;
}