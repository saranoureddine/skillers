import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProfLikesPublicService } from '../services/prof-likes.public.service';
import { LikeDto } from '../dto/like.dto';
import { GetLikesDto } from '../dto/get-likes.dto';
import { GetUserLikesDto } from '../dto/get-user-likes.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfLikesPublicControllerDocs } from '../docs/prof-likes.swagger';

/**
 * Public Prof Likes Controller — handles all public/user-facing endpoints matching Yii API
 * All routes prefixed with /public/prof-likes
 */
@Controller('public/prof-likes')
@ProfLikesPublicControllerDocs.controller()
export class ProfLikesPublicController {
  constructor(
    private readonly likesPublicService: ProfLikesPublicService,
  ) {}

  @Post('like')
  @Public() // Temporarily public - will validate token manually
  @ProfLikesPublicControllerDocs.like()
  async like(@Body() dto: LikeDto, @Req() req: Request) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.likesPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const languageCode = (req.headers['language'] as string) || 'en';
    return this.likesPublicService.like(dto, user.id, languageCode);
  }

  @Post('unlike')
  @Public() // Temporarily public - will validate token manually
  @ProfLikesPublicControllerDocs.unlike()
  async unlike(@Body() dto: LikeDto, @Req() req: Request) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.likesPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const languageCode = (req.headers['language'] as string) || 'en';
    return this.likesPublicService.unlike(dto, user.id, languageCode);
  }

  @Post('toggle-like')
  @Public() // Temporarily public - will validate token manually
  @ProfLikesPublicControllerDocs.toggleLike()
  async toggleLike(@Body() dto: LikeDto, @Req() req: Request) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.likesPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const languageCode = (req.headers['language'] as string) || 'en';
    return this.likesPublicService.toggleLike(dto, user.id, languageCode);
  }

  @Post('get-likes')
  @Public() // Temporarily public - will validate token manually
  @ProfLikesPublicControllerDocs.getLikes()
  async getLikes(@Body() dto: GetLikesDto, @Req() req: Request) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.likesPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const languageCode = (req.headers['language'] as string) || 'en';
    return this.likesPublicService.getLikes(dto, user.id, languageCode);
  }

  @Post('get-user-likes')
  @Public() // Temporarily public - will validate token manually
  @ProfLikesPublicControllerDocs.getUserLikes()
  async getUserLikes(@Body() dto: GetUserLikesDto, @Req() req: Request) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.likesPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const languageCode = (req.headers['language'] as string) || 'en';
    return this.likesPublicService.getUserLikes(dto, user.id, languageCode);
  }

  @Post('check-like')
  @Public() // Temporarily public - will validate token manually
  @ProfLikesPublicControllerDocs.checkLike()
  async checkLike(@Body() dto: LikeDto, @Req() req: Request) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.likesPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const languageCode = (req.headers['language'] as string) || 'en';
    return this.likesPublicService.checkLike(dto, user.id, languageCode);
  }
}
