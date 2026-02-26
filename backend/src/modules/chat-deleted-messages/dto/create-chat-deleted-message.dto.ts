import { IsNotEmpty, IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateChatDeletedMessageDto {
  @ApiProperty({
    description: 'Message ID to mark as deleted',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  messageId: number;

  @ApiProperty({
    description: 'User ID who is deleting the message',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  deletedBy: string;
}
