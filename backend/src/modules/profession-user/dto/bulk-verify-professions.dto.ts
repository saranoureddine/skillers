import { IsNotEmpty, IsArray, IsInt, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BulkVerifyProfessionsDto {
  @ApiProperty({
    description: 'Array of Profession User IDs to verify',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  professionUserIds: number[];

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
