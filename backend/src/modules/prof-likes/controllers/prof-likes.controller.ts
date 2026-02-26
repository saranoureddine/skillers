import { Controller, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ProfLikesService } from '../services/prof-likes.service';
import { ProfLikesPublicService } from '../services/prof-likes.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfLikesControllerDocs } from '../docs/prof-likes.swagger';

/**
 * Shared Prof Likes Controller — common endpoints accessible by authenticated users.
 * All routes prefixed with /prof-likes
 */
@Controller('prof-likes')
@ProfLikesControllerDocs.controller()
export class ProfLikesController {
  constructor(
    private readonly likesService: ProfLikesService,
    private readonly likesPublicService: ProfLikesPublicService,
  ) {}

  @Get(':id')
  @Public() // Temporarily public - will validate token manually
  @ProfLikesControllerDocs.findOne()
  async findOne(@Req() req: Request, @Param('id') id: string) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    // Find user by token to verify authentication
    const authenticatedUser = await this.likesPublicService.findUserByToken(token);
    if (!authenticatedUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Get the requested like
    return this.likesService.findById(Number(id));
  }
}
