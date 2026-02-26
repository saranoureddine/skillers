import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class DeleteNotificationDto {
  @ApiProperty({
    description: 'Notification ID to delete',
    example: '10258-1a27',
    maxLength: 50,
  })
  @Transform(({ value }) => String(value)) // Ensure it's always a string
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  notification_id: string;
}
