import { IsNotEmpty, IsInt, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateUserProfessionDto {
  @ApiProperty({
    description: 'Profession User ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  professionUserId: number;

  @ApiPropertyOptional({
    description: 'Whether this is the primary profession',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  @Type(() => Number)
  isPrimary?: number;

  @ApiPropertyOptional({
    description: 'Years of experience',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  experienceYears?: number;
}
