import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResponseStatus } from '../../domain/enums/request-type.enum';

export class RespondRequestDto {
  @ApiProperty({ enum: ResponseStatus, default: ResponseStatus.PENDING, description: 'Статус отклика' })
  @IsEnum(ResponseStatus)
  status: ResponseStatus = ResponseStatus.PENDING;

  @ApiPropertyOptional({ description: 'Сообщение для создателя заявки' })
  @IsString()
  @IsOptional()
  message?: string;
}