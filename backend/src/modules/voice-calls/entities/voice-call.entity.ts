import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * VoiceCall Entity matching Yii VoiceCalls model structure
 * Table: voice_calls
 */
@Entity('voice_calls')
@Index(['callerId'])
@Index(['receiverId'])
@Index(['callId'], { unique: true })
export class VoiceCallEntity {
  @ApiProperty({
    description: 'Call record ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Unique call identifier',
    example: 'call_507f1f77bcf86cd799439011_1234567890',
    maxLength: 255,
  })
  @Column({ name: 'call_id', type: 'varchar', length: 255, unique: true })
  callId: string;

  @ApiProperty({
    description: 'User ID who initiated the call',
    example: '507f1f77bcf86cd799439011',
    maxLength: 255,
  })
  @Column({ name: 'caller_id', type: 'varchar', length: 255 })
  callerId: string;

  @ApiProperty({
    description: 'User ID who receives the call',
    example: '507f1f77bcf86cd799439012',
    maxLength: 255,
  })
  @Column({ name: 'receiver_id', type: 'varchar', length: 255 })
  receiverId: string;

  @ApiProperty({
    description: 'Agora channel name',
    example: 'channel_507f1f77bcf86cd799439011',
    maxLength: 255,
  })
  @Column({ name: 'channel_name', type: 'varchar', length: 255 })
  channelName: string;

  @ApiProperty({
    description: 'Call type',
    example: 'voice',
    enum: ['voice', 'video'],
    default: 'voice',
  })
  @Column({ type: 'varchar', length: 50, default: 'voice' })
  type: string;

  @ApiProperty({
    description: 'Call status',
    example: 'initiated',
    enum: ['initiated', 'ringing', 'accepted', 'declined', 'ended', 'missed'],
    default: 'initiated',
  })
  @Column({ type: 'varchar', length: 50, default: 'initiated' })
  status: string;

  @ApiPropertyOptional({
    description: 'Call start timestamp',
    example: '2026-02-24T12:00:00.000Z',
    nullable: true,
  })
  @Column({ name: 'started_at', type: 'datetime', nullable: true })
  startedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Call end timestamp',
    example: '2026-02-24T12:05:00.000Z',
    nullable: true,
  })
  @Column({ name: 'ended_at', type: 'datetime', nullable: true })
  endedAt: Date | null;

  @ApiProperty({
    description: 'Call duration in seconds',
    example: 300,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  duration: number;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2026-02-24T12:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Record update timestamp',
    example: '2026-02-24T12:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
