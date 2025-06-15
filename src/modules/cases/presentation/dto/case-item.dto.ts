import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsObject, Min, Max } from 'class-validator';
import { CaseItemType } from '@prisma/client';

export class CreateCaseItemDto {
  @ApiProperty({ description: 'Название приза', example: '50 теннисных мячей' })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Тип приза', 
    enum: CaseItemType,
    example: CaseItemType.VIRTUAL 
  })
  @IsEnum(CaseItemType)
  type: CaseItemType;

  @ApiProperty({ 
    description: 'Данные приза в JSON формате',
    example: { balls: 50 }
  })
  @IsObject()
  payload: any;

  @ApiProperty({ 
    description: 'Шанс выпадения (от 0.01 до 1.0)', 
    example: 0.3 
  })
  @IsNumber()
  @Min(0.01)
  @Max(1.0)
  dropChance: number;

  @ApiPropertyOptional({ description: 'URL изображения приза' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Активен ли приз', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCaseItemDto {
  @ApiPropertyOptional({ description: 'Название приза' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Тип приза', enum: CaseItemType })
  @IsOptional()
  @IsEnum(CaseItemType)
  type?: CaseItemType;

  @ApiPropertyOptional({ description: 'Данные приза в JSON формате' })
  @IsOptional()
  @IsObject()
  payload?: any;

  @ApiPropertyOptional({ description: 'Шанс выпадения (от 0.01 до 1.0)' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(1.0)
  dropChance?: number;

  @ApiPropertyOptional({ description: 'URL изображения приза' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Активен ли приз' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}