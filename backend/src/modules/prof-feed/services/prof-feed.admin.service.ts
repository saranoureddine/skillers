import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProfPostEntity } from '../../prof-posts/entities/prof-post.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { AdminDeletePostDto } from '../dto';

/**
 * Admin ProfFeed Service — handles admin-only feed operations
 * Matches Yii ProfFeedController admin actions exactly
 */
@Injectable()
export class ProfFeedAdminService {
  constructor(
    @InjectRepository(ProfPostEntity)
    private readonly profPostsRepository: Repository<ProfPostEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find user by token (for authentication)
   */
  async findUserByToken(token: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { token, isActivated: 1 },
    });
  }

  /**
   * Delete a post (admin) - Admin can delete any post
   * Matches Yii actionAdminDeletePost() exactly
   */
  async adminDeletePost(
    userId: string,
    dto: AdminDeletePostDto,
    languageCode: string = 'en',
  ): Promise<any> {
    try {
      if (!dto.post_id) {
        throw new BadRequestException('Post ID is required');
      }

      const post = await this.profPostsRepository.findOne({
        where: { id: dto.post_id },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Admin can delete any post - no ownership check
      // Soft delete
      post.isDeleted = 1;
      post.deletedAt = new Date();
      post.deletedBy = userId;
      post.updatedAt = new Date();

      await this.profPostsRepository.save(post);

      return {
        succeeded: true,
        message: 'Post deleted successfully', // TODO: Use UtilsService.findString for language support
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete post: ' + error.message);
    }
  }
}
