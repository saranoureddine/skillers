import { IsNotEmpty, IsInt, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class VerifyUserProfessionDto {
  @ApiProperty({
    description: 'Profession User ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  professionUserId: number;

  @ApiPropertyOptional({
    description: 'Verification status',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  @Type(() => Number)
  isVerified?: number;
}
