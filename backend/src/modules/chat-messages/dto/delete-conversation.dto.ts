import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DeleteConversationDto {
  @ApiProperty({
    description: 'User ID who is deleting the conversation',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Conversation ID to delete',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  conversationId: number;
}
