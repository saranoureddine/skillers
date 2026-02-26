import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

/**
 * Shared specialists service — contains common logic used across admin and public contexts.
 */
@Injectable()
export class SpecialistsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /**
   * Check if user is already a verified specialist
   */
  async isVerifiedSpecialist(userId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM profession_user WHERE user_id = ? AND is_verified = 1',
      [userId],
    );
    return (result[0]?.count || 0) > 0;
  }

  /**
   * Get profession user details
   */
  async getProfessionUserDetails(userId: string): Promise<any> {
    const result = await this.dataSource.query(
      'SELECT profession_id, verified_at as addedDate FROM profession_user WHERE user_id = ? AND is_verified = 1 LIMIT 1',
      [userId],
    );
    return result[0] || null;
  }
}
