import { IsIn, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../entities/prof-notification.entity';

export class GetNotificationsByTypeDto {
  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.LIKE,
  })
  @IsIn([
    NotificationType.LIKE,
    NotificationType.COMMENT,
    NotificationType.FOLLOW,
    NotificationType.MENTION,
    NotificationType.POST_SHARED,
    NotificationType.COMMENT_REPLY,
    NotificationType.SYSTEM,
  ])
  type: NotificationType;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
