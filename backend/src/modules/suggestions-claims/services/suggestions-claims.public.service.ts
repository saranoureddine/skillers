import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SuggestionsClaimsEntity } from '../entities/suggestions-claims.entity';
import { SuggestionsClaimsRatingsEntity } from '../entities/suggestions-claims-ratings.entity';
import { SuggestionsClaimsService } from './suggestions-claims.service';
import { CreateSuggestionDto } from '../dto/create-suggestion.dto';
import { UpdateSuggestionDto } from '../dto/update-suggestion.dto';
import { GetSuggestionsDto } from '../dto/get-suggestions.dto';
import { RateSuggestionDto } from '../dto/rate-suggestion.dto';
import { UpdateRatingDto } from '../dto/update-rating.dto';
import { GetSuggestionRatingsDto } from '../dto/get-suggestion-ratings.dto';
import { UserEntity } from '../../users/entities/user.entity';

/**
 * Public service — handles all public/user-facing endpoints matching Yii API
 */
@Injectable()
export class SuggestionsClaimsPublicService {
  private readonly baseHost: string;
  private readonly TABLE_SUGGESTIONS = 235; // ag_attachment.table_name value

  constructor(
    @InjectRepository(SuggestionsClaimsEntity)
    private readonly suggestionsClaimsRepository: Repository<SuggestionsClaimsEntity>,
    @InjectRepository(SuggestionsClaimsRatingsEntity)
    private readonly ratingsRepository: Repository<SuggestionsClaimsRatingsEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly suggestionsClaimsService: SuggestionsClaimsService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.baseHost = this.configService.get<string>('BASE_HOST') || 'http://localhost/';
  }

  /**
   * Find user by token (for authentication)
   */
  async findUserByToken(token: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { token, isActivated: 1 },
    });
  }

  /**
   * Validate token and return user info (matching Yii GeneralController::validateToken)
   */
  async validateToken(token: string | null): Promise<any> {
    if (!token) {
      return { success: false, message: 'No token provided' };
    }

    // Try to find in users table first
    const user = await this.findUserByToken(token);
    if (user) {
      return {
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          is_guest: user.isGuest,
        },
      };
    }

    // Try to find in ag_users table
    const adminUsers = await this.dataSource.query(
      `
      SELECT user_id, first_name, last_name, user_role, country, phone_number_one, email_address
      FROM ag_users
      WHERE token = ? AND is_activated = 1
      `,
      [token],
    );

    if (adminUsers && adminUsers.length > 0) {
      const admin = adminUsers[0];
      return {
        success: true,
        user: {
          user_id: admin.user_id,
          first_name: admin.first_name,
          last_name: admin.last_name,
          user_role: admin.user_role,
          country: admin.country,
          phone_number_one: admin.phone_number_one,
          email_address: admin.email_address,
        },
      };
    }

    return { success: false, message: 'Invalid token' };
  }

  /**
   * Add suggestion/claim (actionAddSuggestion)
   */
  async addSuggestion(dto: CreateSuggestionDto, user: any): Promise<any> {
    try {
      // Check if user is a guest
      if (user.is_guest === 1) {
        throw new ForbiddenException('guest_user_restricted');
      }

      // Validate category exists
      const category = await this.dataSource.query(
        `SELECT id FROM categories WHERE id = ?`,
        [dto.category_id],
      );
      if (!category || category.length === 0) {
        throw new NotFoundException('Category not found');
      }

      // Validate city exists
      const city = await this.dataSource.query(
        `SELECT id FROM cities WHERE id = ?`,
        [dto.city_id],
      );
      if (!city || city.length === 0) {
        throw new NotFoundException('City not found');
      }

      const isAdmin = !!user.user_id;
      const now = new Date();

      const suggestion = this.suggestionsClaimsRepository.create({
        id: this.suggestionsClaimsService.generateUniqueId(),
        categoryId: dto.category_id,
        cityId: dto.city_id,
        details: dto.details,
        type: dto.type,
        createdBy: isAdmin ? null : user.id,
        createdByAdmin: isAdmin ? user.user_id : null,
        status: 'pending',
        isReplied: 0,
        averageRating: 0.0,
        totalRatings: 0,
        createdAt: now,
        updatedAt: now,
      } as Partial<SuggestionsClaimsEntity>);

      await this.suggestionsClaimsRepository.save(suggestion);

      // Send notifications to municipality administrators
      await this.notifyMunicipalityAdmins(suggestion);

      return {
        succeeded: true,
        message: 'added_successfully',
        suggestion: suggestion,
        table_name: this.TABLE_SUGGESTIONS,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Server error: ' + error.message);
    }
  }

  /**
   * Get suggestion by ID (actionGetSuggestionById)
   */
  async getSuggestionById(id: string, user: any | null): Promise<any> {
    try {
      if (!id) {
        throw new BadRequestException('Missing required parameter: id');
      }

      const suggestion = await this.dataSource.query(
        `
        SELECT 
          t1.id, t1.details, t1.category_id, t1.city_id,
          t2.category_name, t3.city_name,
          t1.reply, t1.type, t1.is_replied, t1.created_at,
          t1.created_by, t1.created_by_admin, t1.status, t1.updated_at,
          t1.average_rating, t1.total_ratings
        FROM suggestions_claims t1
        INNER JOIN categories t2 ON t2.id = t1.category_id
        INNER JOIN cities t3 ON t3.id = t1.city_id
        WHERE t1.id = ?
        `,
        [id],
      );

      if (!suggestion || suggestion.length === 0) {
        throw new NotFoundException('Suggestion/Claim not found');
      }

      const suggestionData = suggestion[0];

      // Check municipality admin access
      if (user && user.user_id && user.user_role === 1666) {
        const adminCities = await this.dataSource.query(
          `SELECT city_id FROM ag_users_cities WHERE user_id = ?`,
          [user.user_id],
        );
        const cityIds = adminCities.map((ac: any) => ac.city_id);
        if (cityIds.length > 0 && !cityIds.includes(suggestionData.city_id)) {
          throw new ForbiddenException('Access denied to this suggestion/claim');
        }
      }

      // Get creator information
      const createdBy = await this.suggestionsClaimsService.getCreatorInfo(
        suggestionData.created_by,
        suggestionData.created_by_admin,
      );

      suggestionData.createdBy = createdBy || null;
      delete suggestionData.created_by;
      delete suggestionData.created_by_admin;

      // Add rating information
      suggestionData.rating = {
        average: suggestionData.average_rating || 0,
        total: suggestionData.total_ratings || 0,
        formatted:
          suggestionData.average_rating
            ? `${Number(suggestionData.average_rating).toFixed(1)} ★ (${suggestionData.total_ratings} rating${suggestionData.total_ratings > 1 ? 's' : ''})`
            : 'No ratings yet',
      };

      // Add user's rating if authenticated
      if (user) {
        const userId = user.user_id || user.id;
        const userRating = await this.ratingsRepository.findOne({
          where: { suggestionClaimId: id, userId: String(userId) },
        });
        suggestionData.user_rating = userRating ? userRating.rating : null;
      } else {
        suggestionData.user_rating = null;
      }

      // Get images
      suggestionData.images = await this.suggestionsClaimsService.getAttachments(id);

      return {
        succeeded: true,
        suggestion: suggestionData,
        table_name: this.TABLE_SUGGESTIONS,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Server error: ' + error.message);
    }
  }

  /**
   * Get suggestions (actionGetSuggestions)
   */
  async getSuggestions(dto: GetSuggestionsDto, user: any): Promise<any> {
    try {
      const isAdmin = !!user.user_id;
      const isMunicipalityAdmin = isAdmin && user.user_role === 1666;

      let adminCities: number[] = [];
      if (isMunicipalityAdmin) {
        const cities = await this.dataSource.query(
          `SELECT city_id FROM ag_users_cities WHERE user_id = ?`,
          [user.user_id],
        );
        adminCities = cities.map((c: any) => c.city_id);
      }

      let query = `
        SELECT 
          t1.id, t1.details, t1.category_id, t1.city_id,
          t2.category_name, t2.category_name_ar, t3.city_name,
          t1.reply, t1.type, t1.is_replied, t1.created_at,
          t1.created_by, t1.created_by_admin, t1.status,
          t1.average_rating, t1.total_ratings
        FROM suggestions_claims t1
        INNER JOIN categories t2 ON t2.id = t1.category_id
        INNER JOIN cities t3 ON t3.id = t1.city_id
        WHERE 1=1
      `;

      const params: any[] = [];

      if (isMunicipalityAdmin && adminCities.length > 0) {
        query += ` AND t1.city_id IN (${adminCities.map(() => '?').join(',')})`;
        params.push(...adminCities);
      }

      if (!isAdmin) {
        query += ` AND t1.status NOT IN ('rejected', 'pending')`;
      }

      if (dto.type && ['suggestion', 'claim'].includes(dto.type)) {
        query += ` AND t1.type = ?`;
        params.push(dto.type);
      }

      if (dto.city_id) {
        query += ` AND t1.city_id = ?`;
        params.push(dto.city_id);
      }

      // Get total count
      const countQuery = query.replace(
        /SELECT[\s\S]*?FROM/,
        'SELECT COUNT(*) as total FROM',
      );
      const countResult = await this.dataSource.query(countQuery, params);
      const total = countResult[0]?.total || 0;

      // Pagination
      const page = Math.max(1, dto.page || 1);
      const limit = Math.max(1, dto.limit || 10);
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      query += ` ORDER BY t1.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const rows = await this.dataSource.query(query, params);

      // Process rows
      for (const r of rows) {
        // Get creator information
        const createdBy = await this.suggestionsClaimsService.getCreatorInfo(
          r.created_by,
          r.created_by_admin,
        );
        r.createdBy = createdBy || null;
        delete r.created_by;
        delete r.created_by_admin;

        // Add rating information
        r.rating = {
          average: r.average_rating || 0,
          total: r.total_ratings || 0,
          formatted:
            r.average_rating
              ? `${Number(r.average_rating).toFixed(1)} ★ (${r.total_ratings} rating${r.total_ratings > 1 ? 's' : ''})`
              : 'No ratings yet',
        };

        // Add user's rating if authenticated
        if (isAdmin && user.user_id) {
          const userRating = await this.ratingsRepository.findOne({
            where: { suggestionClaimId: r.id, userId: String(user.user_id) },
          });
          r.user_rating = userRating ? userRating.rating : null;
        } else if (!isAdmin && user.id) {
          const userRating = await this.ratingsRepository.findOne({
            where: { suggestionClaimId: r.id, userId: String(user.id) },
          });
          r.user_rating = userRating ? userRating.rating : null;
        } else {
          r.user_rating = null;
        }

        // Get images
        r.images = await this.suggestionsClaimsService.getAttachments(r.id);
      }

      return {
        succeeded: true,
        page,
        limit,
        total: Number(total),
        totalPages,
        suggestions: rows,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Server error: ' + error.message);
    }
  }

  /**
   * Rate suggestion (actionRateSuggestion)
   */
  async rateSuggestion(dto: RateSuggestionDto, user: any): Promise<any> {
    try {
      if (dto.rating < 1 || dto.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }

      const suggestion = await this.suggestionsClaimsRepository.findOne({
        where: { id: dto.suggestion_id },
      });

      if (!suggestion) {
        throw new NotFoundException('Suggestion/Claim not found');
      }

      const isAdmin = !!user.user_id;
      const userId = isAdmin ? user.user_id : user.id;

      // Check if user already rated
      const existingRating = await this.ratingsRepository.findOne({
        where: { suggestionClaimId: dto.suggestion_id, userId: String(userId) },
      });

      let message: string;
      if (existingRating) {
        // Update existing rating
        existingRating.rating = dto.rating;
        existingRating.updatedAt = new Date();
        await this.ratingsRepository.save(existingRating);
        message = 'Rating updated successfully';
      } else {
        // Create new rating
        const newRating = this.ratingsRepository.create({
          id: this.suggestionsClaimsService.generateUniqueId(),
          suggestionClaimId: dto.suggestion_id,
          userId: String(userId),
          rating: dto.rating,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Partial<SuggestionsClaimsRatingsEntity>);
        await this.ratingsRepository.save(newRating);
        message = 'Rating added successfully';
      }

      // Update suggestion's average rating and total count
      await this.suggestionsClaimsService.updateSuggestionRatings(dto.suggestion_id);

      return {
        succeeded: true,
        message,
        rating: dto.rating,
        suggestion_id: dto.suggestion_id,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Server error: ' + error.message);
    }
  }

  /**
   * Get user rating (actionGetUserRating)
   */
  async getUserRating(suggestionId: string, user: any): Promise<any> {
    try {
      const isAdmin = !!user.user_id;
      const userId = isAdmin ? user.user_id : user.id;

      const ratingRecord = await this.ratingsRepository.findOne({
        where: { suggestionClaimId: suggestionId, userId: String(userId) },
      });

      if (!ratingRecord) {
        return {
          succeeded: true,
          has_rating: false,
          rating: null,
          message: 'No rating found for this suggestion/claim',
        };
      }

      return {
        succeeded: true,
        has_rating: true,
        rating: {
          id: ratingRecord.id,
          rating: ratingRecord.rating,
          created_at: ratingRecord.createdAt,
          updated_at: ratingRecord.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Server error: ' + error.message);
    }
  }

  /**
   * Get suggestion ratings (actionGetSuggestionRatings)
   */
  async getSuggestionRatings(
    suggestionId: string,
    dto: GetSuggestionRatingsDto,
  ): Promise<any> {
    try {
      const suggestion = await this.suggestionsClaimsRepository.findOne({
        where: { id: suggestionId },
      });

      if (!suggestion) {
        throw new NotFoundException('Suggestion/Claim not found');
      }

      const page = Math.max(1, dto.page || 1);
      const limit = Math.max(1, dto.limit || 10);
      const offset = (page - 1) * limit;

      const ratings = await this.dataSource.query(
        `
        SELECT 
          r.id, r.rating, r.created_at, r.updated_at,
          u.first_name, u.last_name, u.email
        FROM suggestion_claim_ratings r
        LEFT JOIN users u ON u.id = r.user_id
        WHERE r.suggestion_claim_id = ?
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
        `,
        [suggestionId, limit, offset],
      );

      const totalResult = await this.dataSource.query(
        `
        SELECT COUNT(*) as total
        FROM suggestion_claim_ratings
        WHERE suggestion_claim_id = ?
        `,
        [suggestionId],
      );
      const total = totalResult[0]?.total || 0;

      // Format ratings
      for (const rating of ratings) {
        rating.user_name = `${rating.first_name || ''} ${rating.last_name || ''}`.trim();
        rating.star_display =
          '★'.repeat(rating.rating) + '☆'.repeat(5 - rating.rating);
        delete rating.first_name;
        delete rating.last_name;
      }

      return {
        succeeded: true,
        ratings,
        pagination: {
          page,
          limit,
          total: Number(total),
          total_pages: Math.ceil(Number(total) / limit),
        },
        suggestion: {
          id: suggestion.id,
          average_rating: suggestion.averageRating,
          total_ratings: suggestion.totalRatings,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Server error: ' + error.message);
    }
  }

  /**
   * Notify municipality administrators about new suggestion/claim
   */
  private async notifyMunicipalityAdmins(suggestion: SuggestionsClaimsEntity): Promise<void> {
    try {
      const city = await this.dataSource.query(
        `SELECT city_name FROM cities WHERE id = ?`,
        [suggestion.cityId],
      );
      const cityName = city && city.length > 0 ? city[0].city_name : 'the city';
      const type = suggestion.type === 'suggestion' ? 'suggestion' : 'claim';
      const detailsSnippet =
        suggestion.details.length > 50
          ? suggestion.details.substring(0, 50) + '...'
          : suggestion.details;

      let subject: string;
      let body: string;
      if (type === 'suggestion') {
        subject = `New Suggestion Received in ${cityName}`;
        body = `A new suggestion was submitted by a resident in ${cityName}: "${detailsSnippet}". Please review it in your dashboard.`;
      } else {
        subject = `New Claim Received in ${cityName}`;
        body = `A new claim was submitted by a resident in ${cityName}: "${detailsSnippet}". Please review it in your dashboard.`;
      }

      // Find municipality administrator group id
      const adminGroup = await this.dataSource.query(
        `SELECT id FROM ag_user_groups WHERE group_name = 'Municipality Administrator'`,
      );
      if (!adminGroup || adminGroup.length === 0) {
        return;
      }
      const adminGroupId = adminGroup[0].id;

      // Find all admins for this city
      const adminUsers = await this.dataSource.query(
        `
        SELECT u.user_id, u.phone_number_one
        FROM ag_users u
        INNER JOIN ag_users_cities uc ON uc.user_id = u.user_id
        WHERE u.user_role = ? AND uc.city_id = ?
        `,
        [adminGroupId, suggestion.cityId],
      );

      for (const admin of adminUsers) {
        // Create dashboard notification
        const createdBy = suggestion.createdBy || suggestion.createdByAdmin;
        await this.suggestionsClaimsService.createNotification(
          admin.user_id,
          subject,
          body,
          this.TABLE_SUGGESTIONS,
          suggestion.id,
          createdBy,
        );

        // If admin also exists in users table (by phone), send FCM
        const user = await this.usersRepository.findOne({
          where: { phoneNumber: admin.phone_number_one },
        });

        if (user && user.fcmToken) {
          await this.suggestionsClaimsService.sendFCMNotification(
            user.fcmToken,
            subject,
            body,
            {
              table_id: this.TABLE_SUGGESTIONS,
              row_id: suggestion.id,
            },
          );

          // Save notification for mobile user
          await this.suggestionsClaimsService.createNotification(
            user.id,
            subject,
            body,
            this.TABLE_SUGGESTIONS,
            suggestion.id,
            createdBy,
          );
        }
      }
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      // Don't throw - notification failure shouldn't break the main flow
    }
  }
}
