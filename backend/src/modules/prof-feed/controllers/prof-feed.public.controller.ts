import {
  Body,
  Controller,
  Post,
  Req,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProfFeedPublicService } from '../services/prof-feed.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfFeedPublicControllerDocs } from '../docs/prof-feed.swagger';
import {
  GetPersonalizedFeedDto,
  GetTimelineDto,
  FeedGetTrendingPostsDto,
  GetPostsByProfessionDto,
  GetPostsByCategoryDto,
  GetFeedRecommendationsDto,
} from '../dto';

/**
 * Public ProfFeed Controller — handles all professional feed endpoints matching Yii API
 * All routes prefixed with /public/prof-feed
 */
@Controller('public/prof-feed')
@ProfFeedPublicControllerDocs.controller()
export class ProfFeedPublicController {
  constructor(private readonly profFeedPublicService: ProfFeedPublicService) {}

  /**
   * Helper method to extract and validate token
   */
  private async validateToken(req: Request): Promise<string> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.profFeedPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user.id;
  }

  @Post('get-personalized-feed')
  @Public() // Temporarily public - will validate token manually
  @ProfFeedPublicControllerDocs.getPersonalizedFeed()
  async getPersonalizedFeed(
    @Req() req: Request,
    @Body() dto: GetPersonalizedFeedDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profFeedPublicService.getPersonalizedFeed(userId, dto, languageCode || 'en');
  }

  @Post('get-timeline')
  @Public() // Temporarily public - will validate token manually
  @ProfFeedPublicControllerDocs.getTimeline()
  async getTimeline(
    @Req() req: Request,
    @Body() dto: GetTimelineDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profFeedPublicService.getTimeline(userId, dto, languageCode || 'en');
  }

  @Post('get-trending-posts')
  @Public() // Temporarily public - will validate token manually
  @ProfFeedPublicControllerDocs.getTrendingPosts()
  async getTrendingPosts(
    @Req() req: Request,
    @Body() dto: FeedGetTrendingPostsDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profFeedPublicService.getTrendingPosts(userId, dto, languageCode || 'en');
  }

  @Post('get-posts-by-profession')
  @Public() // Temporarily public - will validate token manually
  @ProfFeedPublicControllerDocs.getPostsByProfession()
  async getPostsByProfession(
    @Req() req: Request,
    @Body() dto: GetPostsByProfessionDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profFeedPublicService.getPostsByProfession(userId, dto, languageCode || 'en');
  }

  @Post('get-posts-by-category')
  @Public() // Temporarily public - will validate token manually
  @ProfFeedPublicControllerDocs.getPostsByCategory()
  async getPostsByCategory(
    @Req() req: Request,
    @Body() dto: GetPostsByCategoryDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profFeedPublicService.getPostsByCategory(userId, dto, languageCode || 'en');
  }

  @Post('get-group-feed')
  @Public() // Temporarily public - will validate token manually
  @ProfFeedPublicControllerDocs.getGroupFeed()
  async getGroupFeed() {
    // Group functionality not available - groups not supported in current database schema
    return {
      succeeded: false,
      message: 'Group functionality not available - groups not supported in current database schema',
    };
  }

  @Post('get-feed-recommendations')
  @Public() // Temporarily public - will validate token manually
  @ProfFeedPublicControllerDocs.getFeedRecommendations()
  async getFeedRecommendations(
    @Req() req: Request,
    @Body() dto: GetFeedRecommendationsDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profFeedPublicService.getFeedRecommendations(userId, dto, languageCode || 'en');
  }
}
