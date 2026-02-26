import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateChatConversationDto {
  @ApiProperty({
    description: 'First user ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  userOne: string;

  @ApiProperty({
    description: 'Second user ID',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  userTwo: string;

  @ApiPropertyOptional({
    description: 'User one room status',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  userOneRoomStatus?: boolean;

  @ApiPropertyOptional({
    description: 'User two room status',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  userTwoRoomStatus?: boolean;

  @ApiPropertyOptional({
    description: 'User one typing status',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  userOneTypingStatus?: boolean;

  @ApiPropertyOptional({
    description: 'User two typing status',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  userTwoTypingStatus?: boolean;
}
