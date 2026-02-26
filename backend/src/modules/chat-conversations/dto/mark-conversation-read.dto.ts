import { IsNotEmpty, IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class MarkConversationReadDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  conversationId: number;

  @ApiProperty({
    description: 'User ID who is marking the conversation as read',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  readerId: string;
}
