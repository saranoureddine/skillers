import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Prof Group Entity matching Yii ProfGroups model structure
 * Table: prof_groups
 */
@Entity('prof_groups')
@Index(['ownerId'])
@Index(['categoryId'])
@Index(['isPublic', 'isActive'])
@Index(['isActive'])
export class ProfGroupEntity extends BaseEntity {
  @ApiProperty({
    description: 'Group name',
    example: 'Web Developers',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiPropertyOptional({
    description: 'Group description',
    example: 'A group for web developers to share knowledge',
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Group owner ID',
    example: '507f1f77bcf86cd799439011',
    maxLength: 20,
  })
  @Column({ name: 'owner_id', type: 'varchar', length: 20 })
  @Index()
  ownerId: string;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: 1,
  })
  @Column({ name: 'category_id', type: 'int', nullable: true })
  @Index()
  categoryId: number | null;

  @ApiProperty({
    description: 'Whether group is public',
    example: 1,
    default: 1,
  })
  @Column({ name: 'is_public', type: 'tinyint', default: 1 })
  @Index()
  isPublic: number;

  @ApiProperty({
    description: 'Whether group is active',
    example: 1,
    default: 1,
  })
  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  @Index()
  isActive: number;

  @ApiProperty({
    description: 'Members count',
    example: 0,
    default: 0,
  })
  @Column({ name: 'members_count', type: 'int', default: 0 })
  membersCount: number;

  @ApiProperty({
    description: 'Posts count',
    example: 0,
    default: 0,
  })
  @Column({ name: 'posts_count', type: 'int', default: 0 })
  postsCount: number;

  @ApiPropertyOptional({
    description: 'Cover image path',
    example: '/uploads/groups/cover.jpg',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'cover_image', type: 'varchar', length: 255, nullable: true })
  coverImage: string | null;
}
