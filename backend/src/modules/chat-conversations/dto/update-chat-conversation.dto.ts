import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateChatConversationDto {
  @ApiPropertyOptional({
    description: 'User one room status',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  userOneRoomStatus?: boolean;

  @ApiPropertyOptional({
    description: 'User two room status',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  userTwoRoomStatus?: boolean;

  @ApiPropertyOptional({
    description: 'User one typing status',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  userOneTypingStatus?: boolean;

  @ApiPropertyOptional({
    description: 'User two typing status',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  userTwoTypingStatus?: boolean;
}
