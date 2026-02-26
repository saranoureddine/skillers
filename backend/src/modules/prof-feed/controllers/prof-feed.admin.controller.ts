import {
  Body,
  Controller,
  Post,
  Req,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProfFeedAdminService } from '../services/prof-feed.admin.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfFeedAdminControllerDocs } from '../docs/prof-feed.swagger';
import { AdminDeletePostDto } from '../dto';

/**
 * Admin ProfFeed Controller — handles admin-only feed endpoints matching Yii API
 * All routes prefixed with /admin/prof-feed
 */
@Controller('admin/prof-feed')
@ProfFeedAdminControllerDocs.controller()
export class ProfFeedAdminController {
  constructor(private readonly profFeedAdminService: ProfFeedAdminService) {}

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

    const user = await this.profFeedAdminService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user.id;
  }

  @Post('admin-delete-post')
  @Public() // Temporarily public - will validate token manually
  @ProfFeedAdminControllerDocs.adminDeletePost()
  async adminDeletePost(
    @Req() req: Request,
    @Body() dto: AdminDeletePostDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profFeedAdminService.adminDeletePost(userId, dto, languageCode || 'en');
  }
}
