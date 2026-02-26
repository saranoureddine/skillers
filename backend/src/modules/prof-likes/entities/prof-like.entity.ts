import { Column, Entity, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Prof Like Entity matching Yii ProfLikes model structure
 * Table: prof_likes
 */
@Entity('prof_likes')
@Index(['userId', 'likeableType', 'likeableId'], { unique: true })
@Index(['likeableType', 'likeableId'])
export class ProfLikeEntity extends BaseEntity {
  @ApiProperty({
    description: 'User ID who liked',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'user_id', type: 'varchar', length: 20 })
  @Index()
  userId: string;

  @ApiProperty({
    description: 'Type of item liked',
    example: 'post',
    enum: ['post', 'comment'],
    maxLength: 20,
  })
  @Column({ name: 'likeable_type', type: 'varchar', length: 20 })
  @Index()
  likeableType: string;

  @ApiProperty({
    description: 'ID of the liked item (post or comment)',
    example: 1,
  })
  @Column({ name: 'likeable_id', type: 'int' })
  @Index()
  likeableId: number;
}
