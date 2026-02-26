import { Controller, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ProfessionsService } from '../services/professions.service';
import { ProfessionsPublicService } from '../services/professions.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfessionsControllerDocs } from '../docs/professions.swagger';

/**
 * Shared Professions Controller — common endpoints accessible by authenticated users.
 * All routes prefixed with /professions
 */
@Controller('professions')
@ProfessionsControllerDocs.controller()
export class ProfessionsController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly professionsPublicService: ProfessionsPublicService,
  ) {}

  @Get(':id')
  @Public() // Temporarily public - will validate token manually
  @ProfessionsControllerDocs.findOne()
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
    const authenticatedUser = await this.professionsPublicService.findUserByToken(token);
    if (!authenticatedUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Get the requested profession
    return this.professionsService.findById(Number(id));
  }
}
