import {
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplySuggestionDto {
  @ApiProperty({
    description: 'Suggestion/Claim ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Reply message',
    example: 'Thank you for your suggestion. We will review it.',
  })
  @IsNotEmpty()
  @IsString()
  reply: string;
}
