import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckIfBlockedDto {
  @ApiProperty({
    description: 'Target user ID to check',
    example: 'f98c897cbd6345478c5b',
    maxLength: 20,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  targetUserId: string;
}
