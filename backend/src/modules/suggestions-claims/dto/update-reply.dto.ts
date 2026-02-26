import {
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReplyDto {
  @ApiProperty({
    description: 'Reply message',
    example: 'Updated reply message.',
  })
  @IsNotEmpty()
  @IsString()
  reply: string;
}
