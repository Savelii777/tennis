import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TelegramLoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  auth_date: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hash: string;
  
  @ApiProperty({ required: false })
  @IsString()
  photo_url?: string;
  
  @ApiProperty({ required: false })
  @IsString()
  last_name?: string;
}