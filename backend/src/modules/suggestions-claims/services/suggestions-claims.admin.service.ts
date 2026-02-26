import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SuggestionsClaimsEntity } from '../entities/suggestions-claims.entity';
import { SuggestionsClaimsRatingsEntity } from '../entities/suggestions-claims-ratings.entity';
import { SuggestionsClaimsService } from './suggestions-claims.service';
import { ReplySuggestionDto } from '../dto/reply-suggestion.dto';
import { UpdateReplyDto } from '../dto/update-reply.dto';
import { UpdateSuggestionDto } from '../dto/update-suggestion.dto';
import { UpdateRatingDto } from '../dto/update-rating.dto';
import { UserEntity } from '../../users/entities/user.entity';

/**
 * Admin service — handles admin-only endpoints matching Yii API
 */
@Injectable()
export class SuggestionsClaimsAdminService {
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
   * Reply to suggestion (actionReply)
   */
  async replySuggestion(dto: ReplySuggestionDto, user: any): Promise<any> {
    try {
      const suggestion = await this.suggestionsClaimsRepository.findOne({
        where: { id: dto.id },
      });

      if (!suggestion) {
        throw new NotFoundException('Suggestion/Claim not found');
      }

      suggestion.reply = dto.reply;
      suggestion.isReplied = 1;
      suggestion.updatedAt = new Date();

      await this.suggestionsClaimsRepository.save(suggestion);

      // Notify creator about the reply
      await this.notifyCreatorReply(suggestion, dto.reply);

      return {
        succeeded: true,
        suggestion: suggestion,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Server error: ' + error.message);
    }
  }

  /**
   * Update reply (actionUpdateReply)
   */
  async updateReply(id: string, dto: UpdateReplyDto, user: any): Promise<any> {
    try {
      const suggestion = await this.suggestionsClaimsRepository.findOne({
        where: { id },
      });

      if (!suggestion) {
        throw new NotFoundException('Suggestion/Claim not found');
      }

      if (!suggestion.isReplied) {
        throw new BadRequestException('Cannot update reply - no existing reply found');
      }

      suggestion.reply = dto.reply;
      suggestion.updatedAt = new Date();

      await this.suggestionsClaimsRepository.save(suggestion);

      // Notify creator about the reply update
      await this.notifyCreatorReplyUpdate(suggestion, dto.reply);

      return {
        succeeded: true,
        message: 'reply_updated_successfully',
        suggestion: suggestion,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Server error: ' + error.message);
    }
  }

  /**
   * Update suggestion (actionUpdateSuggestion)
   */
  async updateSuggestion(
    id: string,
    dto: UpdateSuggestionDto,
    user: any,
  ): Promise<any> {
    try {
      const suggestion = await this.suggestionsClaimsRepository.findOne({
        where: { id },
      });

      if (!suggestion) {
        throw new NotFoundException('Suggestion/Claim not found');
      }

      // Check ownership (non-admin users can only update their own)
      const isAdmin = !!user.user_id;
      if (!isAdmin && suggestion.createdBy !== user.id) {
        throw new ForbiddenException("You can only update your own entries");
      }

      // Update allowed fields
      if (dto.category_id !== undefined) {
        const category = await this.dataSource.query(
          `SELECT id FROM categories WHERE id = ?`,
          [dto.category_id],
        );
        if (!category || category.length === 0) {
          throw new NotFoundException('Category not found');
        }
        suggestion.categoryId = dto.category_id;
      }

      if (dto.city_id !== undefined) {
        const city = await this.dataSource.query(
          `SELECT id FROM cities WHERE id = ?`,
          [dto.city_id],
        );
        if (!city || city.length === 0) {
          throw new NotFoundException('City not found');
        }
        suggestion.cityId = dto.city_id;
      }

      if (dto.details !== undefined) {
        suggestion.details = dto.details;
      }

      if (dto.type !== undefined) {
        if (!['suggestion', 'claim'].includes(dto.type)) {
          throw new BadRequestException('Invalid type (suggestion | claim)');
        }
        suggestion.type = dto.type;
      }

      if (dto.status !== undefined) {
        if (!['accepted', 'rejected', 'resolved', 'pending'].includes(dto.status)) {
          throw new BadRequestException(
            'Invalid status (accepted | rejected | resolved | pending)',
          );
        }
        const oldStatus = suggestion.status;
        suggestion.status = dto.status;

        // Notify creator about status change
        if (oldStatus !== dto.status) {
          await this.notifyCreatorStatusChange(suggestion, dto.status);
        }
      }

      suggestion.updatedAt = new Date();
      await this.suggestionsClaimsRepository.save(suggestion);

      return {
        succeeded: true,
        message: 'updated_successfully',
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
   * Delete suggestion (actionDeleteSuggestion)
   */
  async deleteSuggestion(id: string, user: any): Promise<any> {
    try {
      const suggestion = await this.suggestionsClaimsRepository.findOne({
        where: { id },
      });

      if (!suggestion) {
        throw new NotFoundException('Suggestion/Claim not found');
      }

      // Check ownership (non-admin users can only delete their own)
      const isAdmin = !!user.user_id;
      if (!isAdmin && suggestion.createdBy !== user.id) {
        throw new ForbiddenException("You can only delete your own entries");
      }

      await this.suggestionsClaimsRepository.remove(suggestion);

      return {
        succeeded: true,
        message: 'deleted_successfully',
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
   * Update rating (actionUpdateRating)
   */
  async updateRating(id: string, dto: UpdateRatingDto, user: any): Promise<any> {
    try {
      if (dto.rating < 1 || dto.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }

      const isAdmin = !!user.user_id;
      const userId = isAdmin ? user.user_id : user.id;

      const ratingRecord = await this.ratingsRepository.findOne({
        where: { id, userId: String(userId) },
      });

      if (!ratingRecord) {
        throw new NotFoundException(
          "Rating not found or you don't have permission to update it",
        );
      }

      ratingRecord.rating = dto.rating;
      ratingRecord.updatedAt = new Date();
      await this.ratingsRepository.save(ratingRecord);

      // Update suggestion's average rating and total count
      await this.suggestionsClaimsService.updateSuggestionRatings(
        ratingRecord.suggestionClaimId,
      );

      return {
        succeeded: true,
        message: 'Rating updated successfully',
        rating: dto.rating,
        suggestion_id: ratingRecord.suggestionClaimId,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Server error: ' + error.message);
    }
  }

  /**
   * Delete rating (actionDeleteRating)
   */
  async deleteRating(id: string, user: any): Promise<any> {
    try {
      const isAdmin = !!user.user_id;
      const userId = isAdmin ? user.user_id : user.id;

      const ratingRecord = await this.ratingsRepository.findOne({
        where: { id, userId: String(userId) },
      });

      if (!ratingRecord) {
        throw new NotFoundException(
          "Rating not found or you don't have permission to delete it",
        );
      }

      const suggestionId = ratingRecord.suggestionClaimId;
      await this.ratingsRepository.remove(ratingRecord);

      // Update suggestion's average rating and total count
      await this.suggestionsClaimsService.updateSuggestionRatings(suggestionId);

      return {
        succeeded: true,
        message: 'Rating deleted successfully',
        suggestion_id: suggestionId,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Server error: ' + error.message);
    }
  }

  /**
   * Notify creator about reply
   */
  private async notifyCreatorReply(
    suggestion: SuggestionsClaimsEntity,
    reply: string,
  ): Promise<void> {
    try {
      if (!suggestion.createdBy) {
        return;
      }

      const user = await this.usersRepository.findOne({
        where: { id: suggestion.createdBy },
      });

      if (!user) {
        return;
      }

      const city = await this.dataSource.query(
        `SELECT city_name FROM cities WHERE id = ?`,
        [suggestion.cityId],
      );
      const cityName = city && city.length > 0 ? city[0].city_name : 'the city';
      const type = suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1);
      const subject = `${type} Replied in ${cityName}`;
      const body = `Your ${suggestion.type} in ${cityName} has received a reply: "${reply}"`;

      const createdBy = suggestion.createdByAdmin || suggestion.createdBy;
      await this.suggestionsClaimsService.createNotification(
        user.id,
        subject,
        body,
        this.TABLE_SUGGESTIONS,
        suggestion.id,
        createdBy,
      );

      if (user.fcmToken) {
        await this.suggestionsClaimsService.sendFCMNotification(
          user.fcmToken,
          subject,
          body,
          {
            table_id: this.TABLE_SUGGESTIONS,
            row_id: suggestion.id,
          },
        );
      }
    } catch (error) {
      console.error('Failed to notify suggestion/claim creator (reply):', error);
    }
  }

  /**
   * Notify creator about reply update
   */
  private async notifyCreatorReplyUpdate(
    suggestion: SuggestionsClaimsEntity,
    reply: string,
  ): Promise<void> {
    try {
      if (!suggestion.createdBy) {
        return;
      }

      const user = await this.usersRepository.findOne({
        where: { id: suggestion.createdBy },
      });

      if (!user) {
        return;
      }

      const city = await this.dataSource.query(
        `SELECT city_name FROM cities WHERE id = ?`,
        [suggestion.cityId],
      );
      const cityName = city && city.length > 0 ? city[0].city_name : 'the city';
      const type = suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1);
      const subject = `${type} Reply Updated in ${cityName}`;
      const body = `The reply to your ${suggestion.type} in ${cityName} has been updated: "${reply}"`;

      const createdBy = suggestion.createdByAdmin || suggestion.createdBy;
      await this.suggestionsClaimsService.createNotification(
        user.id,
        subject,
        body,
        this.TABLE_SUGGESTIONS,
        suggestion.id,
        createdBy,
      );

      if (user.fcmToken) {
        await this.suggestionsClaimsService.sendFCMNotification(
          user.fcmToken,
          subject,
          body,
          {
            table_id: this.TABLE_SUGGESTIONS,
            row_id: suggestion.id,
          },
        );
      }
    } catch (error) {
      console.error('Failed to notify suggestion/claim creator (reply update):', error);
    }
  }

  /**
   * Notify creator about status change
   */
  private async notifyCreatorStatusChange(
    suggestion: SuggestionsClaimsEntity,
    newStatus: string,
  ): Promise<void> {
    try {
      if (!suggestion.createdBy) {
        return;
      }

      const user = await this.usersRepository.findOne({
        where: { id: suggestion.createdBy },
      });

      if (!user) {
        return;
      }

      const city = await this.dataSource.query(
        `SELECT city_name FROM cities WHERE id = ?`,
        [suggestion.cityId],
      );
      const cityName = city && city.length > 0 ? city[0].city_name : 'the city';
      const type = suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1);

      let subject: string;
      let body: string;

      if (newStatus === 'accepted') {
        subject = `${type} Accepted in ${cityName}`;
        body = `Your ${suggestion.type} in ${cityName} has been accepted.`;
      } else if (newStatus === 'rejected') {
        subject = `${type} Rejected in ${cityName}`;
        body = `Your ${suggestion.type} in ${cityName} has been rejected.`;
      } else if (newStatus === 'resolved') {
        subject = `${type} Resolved in ${cityName}`;
        body = `Your ${suggestion.type} in ${cityName} has been marked as resolved.`;
      } else {
        subject = `${type} Updated in ${cityName}`;
        body = `Your ${suggestion.type} in ${cityName} has been updated.`;
      }

      const createdBy = suggestion.createdByAdmin || suggestion.createdBy;
      await this.suggestionsClaimsService.createNotification(
        user.id,
        subject,
        body,
        this.TABLE_SUGGESTIONS,
        suggestion.id,
        createdBy,
      );

      if (user.fcmToken) {
        await this.suggestionsClaimsService.sendFCMNotification(
          user.fcmToken,
          subject,
          body,
          {
            table_id: this.TABLE_SUGGESTIONS,
            row_id: suggestion.id,
          },
        );
      }
    } catch (error) {
      console.error('Failed to notify suggestion/claim creator (status):', error);
    }
  }
}
