import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'Текст сообщения', example: 'Привет! Хочешь сыграть матч в эти выходные?' })
  @IsNotEmpty({ message: 'Сообщение не может быть пустым' })
  @IsString({ message: 'Сообщение должно быть строкой' })
  @MaxLength(500, { message: 'Сообщение не может превышать 500 символов' })
  message: string;
}