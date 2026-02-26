import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { AddSpecialistDto } from '../dto/add-specialist.dto';
import { SpecialistsService } from './specialists.service';
import { ConfigService } from '@nestjs/config';

/**
 * Public/user-facing service — handles all public endpoints matching Yii API
 */
@Injectable()
export class SpecialistsPublicService {
  private readonly baseHost: string;

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly specialistsService: SpecialistsService,
    private readonly configService: ConfigService,
  ) {
    this.baseHost = this.configService.get<string>('BASE_HOST') || 'https://smartvillageprod.smartvillage.net';
  }

  /**
   * Transform specialist data to match Yii API response format
   */
  private transformSpecialistData(user: any, professionUser?: any): any {
    const profileImage = this.getImageUrl(user.mainImage || null);
    const languages = this.parseLanguages(user.languages || '');

    return {
      id: String(user.id),
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      profileImage,
      imageUrl: profileImage,
      rating: parseFloat(user.averageRating?.toString() || '0'),
      totalRatings: parseInt(user.totalRatings?.toString() || '0', 10),
      experience: parseInt(user.yearsExperience?.toString() || '0', 10),
      specialty: user.userWork || null,
      category: user.specialistCategory || null,
      languages,
      location: user.location || null,
      isOnline: Boolean(user.isOnline || 0),
      lastSeen: user.lastSeen || null,
      phone: `${user.countryCode || ''} ${user.phoneNumber || ''}`.trim(),
      phoneNumber: user.phoneNumber || null,
      hourlyRate: user.hourlyRate ? parseFloat(user.hourlyRate.toString()) : null,
      followers: parseInt(user.followersCount?.toString() || '0', 10),
      isVerified: Boolean(user.specialistVerified || user.isSpecialist || 0),
      professionId: professionUser?.profession_id || 1,
      addedDate: professionUser?.addedDate || null,
      bio: user.bio || '',
      yearsOfExperience: parseInt(user.yearsExperience?.toString() || '0', 10),
      reviewCount: parseInt(user.totalRatings?.toString() || '0', 10),
      email: user.email || null,
      website: user.website || null,
      address: user.address || null,
      gender: user.gender || null,
    };
  }

  /**
   * Get image URL
   */
  private getImageUrl(imagePath: string | null): string {
    if (!imagePath) {
      return 'https://smartvillageprod.smartvillage.net/images/default-avatar.jpg';
    }

    // If already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // If starts with /uploads/
    if (imagePath.startsWith('/uploads/')) {
      return `${this.baseHost}${imagePath}`;
    }

    // Default path
    return `${this.baseHost}/uploads/users/${imagePath.replace(/^\/+/, '')}`;
  }

  /**
   * Parse languages string
   */
  private parseLanguages(languagesString: string): string[] {
    if (!languagesString) {
      return [];
    }

    // Try JSON decode first
    try {
      const languages = JSON.parse(languagesString);
      if (Array.isArray(languages)) {
        return languages;
      }
    } catch (e) {
      // Not JSON, continue to comma separation
    }

    // Fallback to comma separation
    return languagesString.split(',').map((lang) => lang.trim()).filter((lang) => lang.length > 0);
  }

  /**
   * Add user as specialist
   */
  async addSpecialist(dto: AddSpecialistDto): Promise<any> {
    const { userId } = dto;

    // Check if user exists
    const user = await this.specialistsService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already verified specialist
    const isVerified = await this.specialistsService.isVerifiedSpecialist(userId);
    if (isVerified) {
      throw new ConflictException('User is already a verified specialist');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Default profession ID
      const professionId = 1;

      // Insert into profession_user
      await queryRunner.query(
        `INSERT INTO profession_user 
        (user_id, profession_id, is_primary, experience_years, is_verified, verified_at, verified_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), ?, NOW(), NOW())`,
        [userId, professionId, 1, user.yearsExperience || 0, 1, 1],
      );

      // Update users table
      await queryRunner.manager.update(
        UserEntity,
        { id: userId },
        {
          isSpecialist: 1,
          specialistVerified: 1,
          updatedAt: new Date(),
        },
      );

      await queryRunner.commitTransaction();

      // Get updated user with profession details
      const updatedUser = await this.specialistsService.findById(userId);
      const professionUser = await this.specialistsService.getProfessionUserDetails(userId);

      const transformed = this.transformSpecialistData(updatedUser, professionUser);

      return {
        succeeded: true,
        message: 'User successfully added as specialist',
        data: transformed,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add specialist');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get single specialist
   */
  async getSpecialist(id: string): Promise<any> {
    const result = await this.dataSource.query(
      `SELECT u.*, pu.profession_id, pu.verified_at as addedDate
       FROM profession_user pu
       INNER JOIN users u ON pu.user_id = u.id
       WHERE u.id = ? AND pu.is_verified = 1
       LIMIT 1`,
      [id],
    );

    if (!result || result.length === 0) {
      throw new NotFoundException('Specialist not found');
    }

    const row = result[0];
    // Transform snake_case to camelCase for entity fields
    const userData: any = {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      countryCode: row.country_code,
      phoneNumber: row.phone_number,
      mainImage: row.main_image,
      averageRating: row.average_rating,
      totalRatings: row.total_ratings,
      yearsExperience: row.years_experience,
      userWork: row.user_work,
      specialistCategory: row.specialist_category,
      languages: row.languages,
      location: row.location,
      isOnline: row.is_online,
      lastSeen: row.last_seen,
      hourlyRate: row.hourly_rate,
      followersCount: row.followers_count,
      specialistVerified: row.specialist_verified,
      isSpecialist: row.is_specialist,
      bio: row.bio,
      website: row.website,
      address: row.address,
      gender: row.gender,
    };

    const transformed = this.transformSpecialistData(userData, {
      profession_id: row.profession_id,
      addedDate: row.addedDate,
    });

    return {
      succeeded: true,
      data: transformed,
      message: 'Specialist retrieved successfully',
    };
  }
}
