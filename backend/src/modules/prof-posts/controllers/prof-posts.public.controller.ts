import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Req,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProfPostsPublicService } from '../services/prof-posts.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfPostsPublicControllerDocs } from '../docs/prof-posts.swagger';
import {
  CreatePostDto,
  UpdatePostDto,
  GetUserPostsDto,
  GetPostDto,
  DeletePostDto,
  PinPostDto,
  GetFeedDto,
  PostsGetTrendingPostsDto,
} from '../dto';

/**
 * Public ProfPosts Controller — handles all professional posts endpoints matching Yii API
 * All routes prefixed with /public/prof-posts
 */
@Controller('public/prof-posts')
@ProfPostsPublicControllerDocs.controller()
export class ProfPostsPublicController {
  constructor(private readonly profPostsPublicService: ProfPostsPublicService) {}

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

    const user = await this.profPostsPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user.id;
  }

  @Post('create-post')
  @Public() // Temporarily public - will validate token manually
  @ProfPostsPublicControllerDocs.createPost()
  async createPost(
    @Req() req: Request,
    @Body() dto: CreatePostDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profPostsPublicService.createPost(userId, dto, languageCode);
  }

  @Post('get-user-posts')
  @Public() // Temporarily public - will validate token manually
  @ProfPostsPublicControllerDocs.getUserPosts()
  async getUserPosts(
    @Req() req: Request,
    @Body() dto: GetUserPostsDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profPostsPublicService.getUserPosts(userId, dto, languageCode);
  }

  @Post('get-feed')
  @Public() // Temporarily public - will validate token manually
  @ProfPostsPublicControllerDocs.getFeed()
  async getFeed(
    @Req() req: Request,
    @Body() dto: GetFeedDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profPostsPublicService.getFeed(userId, dto, languageCode);
  }

  @Post('get-post')
  @Public() // Temporarily public - will validate token manually
  @ProfPostsPublicControllerDocs.getPost()
  async getPost(
    @Req() req: Request,
    @Body() dto: GetPostDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profPostsPublicService.getPost(userId, dto, languageCode);
  }

  @Post('update-post')
  @Public() // Temporarily public - will validate token manually
  @ProfPostsPublicControllerDocs.updatePost()
  async updatePost(
    @Req() req: Request,
    @Body() dto: UpdatePostDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profPostsPublicService.updatePost(userId, dto, languageCode);
  }

  @Post('delete-post')
  @Public() // Temporarily public - will validate token manually
  @ProfPostsPublicControllerDocs.deletePost()
  async deletePost(
    @Req() req: Request,
    @Body() dto: DeletePostDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profPostsPublicService.deletePost(userId, dto, languageCode);
  }

  @Post('pin-post')
  @Public() // Temporarily public - will validate token manually
  @ProfPostsPublicControllerDocs.pinPost()
  async pinPost(
    @Req() req: Request,
    @Body() dto: PinPostDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profPostsPublicService.pinPost(userId, dto, languageCode);
  }

  @Post('get-user-posts-with-details')
  @Public() // Temporarily public - will validate token manually
  @ProfPostsPublicControllerDocs.getUserPostsWithDetails()
  async getUserPostsWithDetails(
    @Req() req: Request,
    @Body() dto: GetUserPostsDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profPostsPublicService.getUserPostsWithDetails(userId, dto, languageCode);
  }

  @Post('get-trending-posts')
  @Public() // Temporarily public - will validate token manually
  @ProfPostsPublicControllerDocs.getTrendingPosts()
  async getTrendingPosts(
    @Req() req: Request,
    @Body() dto: PostsGetTrendingPostsDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profPostsPublicService.getTrendingPosts(userId, dto, languageCode);
  }
}
