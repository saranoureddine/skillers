import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitiateCallDto {
  @ApiProperty({
    description: 'ID of the user to call',
    example: '507f1f77bcf86cd799439012',
  })
  @IsNotEmpty()
  @IsString()
  receiverId: string;

  @ApiPropertyOptional({
    description: 'Call type',
    example: 'voice',
    enum: ['voice', 'video'],
    default: 'voice',
  })
  @IsOptional()
  @IsIn(['voice', 'video'])
  type?: string;
}
