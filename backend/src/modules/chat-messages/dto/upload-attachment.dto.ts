import { IsNotEmpty, IsString, IsInt, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UploadAttachmentDto {
  @ApiProperty({
    description: 'Sender user ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  senderId: string;

  @ApiProperty({
    description: 'Receiver user ID',
    example: '507f1f77bcf86cd799439012',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @ApiProperty({
    description: 'Conversation ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  conversationId: number;

  @ApiPropertyOptional({
    description: 'Message type',
    example: 'image',
    enum: ['image', 'video', 'document', 'audio', 'voice'],
    default: 'image',
  })
  @IsOptional()
  @IsString()
  @IsIn(['image', 'video', 'document', 'audio', 'voice'])
  messageType?: string;

  @ApiPropertyOptional({
    description: 'Optional caption/message text',
    example: 'Check this out!',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'Reply to message ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  reply?: number;

  @ApiPropertyOptional({
    description: 'Product ID',
    example: '507f1f77bcf86cd799439013',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  productId?: string;
}
