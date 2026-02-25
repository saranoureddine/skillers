import {
  Body,
  Controller,
  Post,
  Req,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProfCommentsPublicService } from '../services/prof-comments.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfCommentsPublicControllerDocs } from '../docs/prof-posts.swagger';
import {
  CreateCommentDto,
  UpdateCommentDto,
  DeleteCommentDto,
  GetPostCommentsDto,
  GetCommentRepliesDto,
  GetUserCommentsDto,
} from '../dto';

/**
 * Public ProfComments Controller — handles all professional comments endpoints matching Yii API
 * All routes prefixed with /public/prof-comments
 */
@Controller('public/prof-comments')
@ProfCommentsPublicControllerDocs.controller()
export class ProfCommentsPublicController {
  constructor(private readonly profCommentsPublicService: ProfCommentsPublicService) {}

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

    const user = await this.profCommentsPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user.id;
  }

  @Post('create-comment')
  @Public() // Temporarily public - will validate token manually
  @ProfCommentsPublicControllerDocs.createComment()
  async createComment(
    @Req() req: Request,
    @Body() dto: CreateCommentDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profCommentsPublicService.createComment(userId, dto, languageCode);
  }

  @Post('get-post-comments')
  @Public() // Temporarily public - will validate token manually
  @ProfCommentsPublicControllerDocs.getPostComments()
  async getPostComments(
    @Req() req: Request,
    @Body() dto: GetPostCommentsDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profCommentsPublicService.getPostComments(userId, dto, languageCode);
  }

  @Post('update-comment')
  @Public() // Temporarily public - will validate token manually
  @ProfCommentsPublicControllerDocs.updateComment()
  async updateComment(
    @Req() req: Request,
    @Body() dto: UpdateCommentDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profCommentsPublicService.updateComment(userId, dto, languageCode);
  }

  @Post('delete-comment')
  @Public() // Temporarily public - will validate token manually
  @ProfCommentsPublicControllerDocs.deleteComment()
  async deleteComment(
    @Req() req: Request,
    @Body() dto: DeleteCommentDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profCommentsPublicService.deleteComment(userId, dto, languageCode);
  }

  @Post('get-comment-replies')
  @Public() // Temporarily public - will validate token manually
  @ProfCommentsPublicControllerDocs.getCommentReplies()
  async getCommentReplies(
    @Req() req: Request,
    @Body() dto: GetCommentRepliesDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profCommentsPublicService.getCommentReplies(userId, dto, languageCode);
  }

  @Post('get-user-comments')
  @Public() // Temporarily public - will validate token manually
  @ProfCommentsPublicControllerDocs.getUserComments()
  async getUserComments(
    @Req() req: Request,
    @Body() dto: GetUserCommentsDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profCommentsPublicService.getUserComments(userId, dto, languageCode);
  }
}
