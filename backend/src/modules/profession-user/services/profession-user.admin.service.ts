import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProfessionUserEntity } from '../entities/profession-user.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { VerifyUserProfessionDto } from '../dto/verify-user-profession.dto';
import { BulkVerifyProfessionsDto } from '../dto/bulk-verify-professions.dto';
import { TopSpecialistDto } from '../dto/top-specialist.dto';
import { ProfessionUserService } from './profession-user.service';

/**
 * Admin-only service — handles admin endpoints for profession user management
 */
@Injectable()
export class ProfessionUserAdminService {
  constructor(
    @InjectRepository(ProfessionUserEntity)
    private readonly professionUserRepository: Repository<ProfessionUserEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly professionUserService: ProfessionUserService,
  ) {}

  /**
   * Get all profession users (admin)
   */
  async getAllProfessionUsers(): Promise<ProfessionUserEntity[]> {
    return this.professionUserRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get statistics (admin)
   */
  async getStatistics(): Promise<any> {
    const total = await this.professionUserRepository.count();
    const verified = await this.professionUserRepository.count({
      where: { isVerified: 1 },
    });
    const primary = await this.professionUserRepository.count({
      where: { isPrimary: 1 },
    });

    return {
      total,
      verified,
      unverified: total - verified,
      primary,
    };
  }

  /**
   * Verify user profession (admin)
   */
  async verifyUserProfession(
    dto: VerifyUserProfessionDto,
    adminUserId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const professionUser = await this.professionUserService.findById(dto.professionUserId);

      professionUser.isVerified = dto.isVerified !== undefined ? dto.isVerified : 1;
      professionUser.verifiedBy = adminUserId;
      professionUser.verifiedAt = new Date();

      await this.professionUserRepository.save(professionUser);

      return {
        succeeded: true,
        message: professionUser.isVerified === 1 ? 'Profession verified successfully' : 'Profession unverified successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update verification status');
    }
  }

  /**
   * Bulk verify professions (admin)
   */
  async bulkVerifyProfessions(
    dto: BulkVerifyProfessionsDto,
    adminUserId: string,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      const { professionUserIds, isVerified = 1 } = dto;

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const professionUserId of professionUserIds) {
        try {
          const professionUser = await this.professionUserService.findById(professionUserId);
          professionUser.isVerified = isVerified;
          professionUser.verifiedBy = adminUserId;
          professionUser.verifiedAt = new Date();
          await this.professionUserRepository.save(professionUser);
          successCount++;
        } catch (error) {
          failedCount++;
          errors.push(`Failed to update profession user ID: ${professionUserId}`);
        }
      }

      return {
        succeeded: true,
        message: 'Bulk verification completed',
        results: {
          total_processed: professionUserIds.length,
          successful: successCount,
          failed: failedCount,
          errors: errors.length > 0 ? errors : undefined,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to bulk verify professions');
    }
  }

  /**
   * Add top specialist flag
   */
  async addTopSpecialist(dto: TopSpecialistDto, languageCode: string = 'en'): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({ where: { id: dto.userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if is_top column exists, if not, this will fail gracefully
      (user as any).isTop = 1;
      await this.usersRepository.save(user);

      return {
        succeeded: true,
        message: 'User marked as top specialist successfully',
        user_id: dto.userId,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  /**
   * Remove top specialist flag
   */
  async removeTopSpecialist(dto: TopSpecialistDto, languageCode: string = 'en'): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({ where: { id: dto.userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      (user as any).isTop = 0;
      await this.usersRepository.save(user);

      return {
        succeeded: true,
        message: 'User removed from top specialists successfully',
        user_id: dto.userId,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user');
    }
  }
}
