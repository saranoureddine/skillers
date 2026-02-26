import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { GetSpecialistsDto } from '../dto/get-specialists.dto';
import { RemoveSpecialistDto } from '../dto/remove-specialist.dto';
import { SpecialistsService } from './specialists.service';
import { SpecialistsPublicService } from './specialists.public.service';
import { ConfigService } from '@nestjs/config';

/**
 * Admin-only service — handles admin endpoints for specialists management
 */
@Injectable()
export class SpecialistsAdminService {
  private readonly baseHost: string;

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly specialistsService: SpecialistsService,
    private readonly specialistsPublicService: SpecialistsPublicService,
    private readonly configService: ConfigService,
  ) {
    this.baseHost = this.configService.get<string>('BASE_HOST') || 'https://smartvillageprod.smartvillage.net';
  }

  /**
   * Get all specialists (admin panel)
   */
  async getAllSpecialists(query: GetSpecialistsDto): Promise<any> {
    const limit = query.limit && query.limit > 0 ? query.limit : 50;
    const page = Math.max(1, query.page || 1);
    const top = query.top || 1; // 1 => top specialists only, 0 => all specialists
    const offset = (page - 1) * limit;

    try {
      // Build query - always filter by is_specialist = 1
      const countQuery = this.dataSource
        .createQueryBuilder()
        .from('users', 'u')
        .where('u.is_specialist = :isSpecialist', { isSpecialist: 1 });

      const total = await countQuery.getCount();

      // Get users using raw query to match Yii behavior
      const rows = await this.dataSource.query(
        `SELECT * FROM users 
         WHERE is_specialist = 1 
         ORDER BY updated_at DESC 
         LIMIT ? OFFSET ?`,
        [limit, offset],
      );

      // Transform data
      const data = await Promise.all(
        rows.map(async (r) => {
          const professionUser = await this.specialistsService.getProfessionUserDetails(r.id);

          const userData: any = {
            ...r,
            profession_id: professionUser?.profession_id || null,
            addedDate: professionUser?.addedDate || null,
          };

          // Use the private method through a helper
          return this.transformSpecialistData(userData, professionUser);
        }),
      );

      return {
        succeeded: true,
        data,
        pagination: {
          total,
          limit,
          page,
          totalPages: limit ? Math.ceil(total / limit) : 1,
        },
        meta: {
          showTop: Boolean(top),
        },
        message: 'Specialists retrieved successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve specialists');
    }
  }

  /**
   * Transform specialist data (same as public service)
   */
  private transformSpecialistData(user: any, professionUser?: any): any {
    const profileImage = this.getImageUrl(user.main_image || null);
    const languages = this.parseLanguages(user.languages || '');

    return {
      id: String(user.id),
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      profileImage,
      imageUrl: profileImage,
      rating: parseFloat(user.average_rating?.toString() || '0'),
      totalRatings: parseInt(user.total_ratings?.toString() || '0', 10),
      experience: parseInt(user.years_experience?.toString() || '0', 10),
      specialty: user.user_work || null,
      category: user.specialist_category || null,
      languages,
      location: user.location || null,
      isOnline: Boolean(user.is_online || 0),
      lastSeen: user.last_seen || null,
      phone: `${user.country_code || ''} ${user.phone_number || ''}`.trim(),
      phoneNumber: user.phone_number || null,
      hourlyRate: user.hourly_rate ? parseFloat(user.hourly_rate.toString()) : null,
      followers: parseInt(user.followers_count?.toString() || '0', 10),
      isVerified: Boolean(user.specialist_verified || user.is_specialist || 0),
      professionId: professionUser?.profession_id || 1,
      addedDate: professionUser?.addedDate || null,
      bio: user.bio || '',
      yearsOfExperience: parseInt(user.years_experience?.toString() || '0', 10),
      reviewCount: parseInt(user.total_ratings?.toString() || '0', 10),
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

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    if (imagePath.startsWith('/uploads/')) {
      return `${this.baseHost}${imagePath}`;
    }

    return `${this.baseHost}/uploads/users/${imagePath.replace(/^\/+/, '')}`;
  }

  /**
   * Parse languages string
   */
  private parseLanguages(languagesString: string): string[] {
    if (!languagesString) {
      return [];
    }

    try {
      const languages = JSON.parse(languagesString);
      if (Array.isArray(languages)) {
        return languages;
      }
    } catch (e) {
      // Not JSON, continue to comma separation
    }

    return languagesString.split(',').map((lang) => lang.trim()).filter((lang) => lang.length > 0);
  }

  /**
   * Remove specialist
   */
  async removeSpecialist(dto: RemoveSpecialistDto): Promise<any> {
    const { userId } = dto;

    // Validate
    if (!userId) {
      throw new BadRequestException('Valid user_id is required');
    }

    // Check if user exists
    const user = await this.specialistsService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is specialist
    if (!user.isSpecialist || user.isSpecialist === 0) {
      throw new BadRequestException('User is not a Top Specialist');
    }

    try {
      // Remove from specialists (set is_specialist = 0)
      await this.usersRepository.update(
        { id: userId },
        {
          isSpecialist: 0,
          updatedAt: new Date(),
        },
      );

      return {
        succeeded: true,
        message: 'User removed from Top Specialists',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to remove specialist');
    }
  }
}
