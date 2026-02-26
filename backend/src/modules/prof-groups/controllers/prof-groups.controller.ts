import { Controller, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ProfGroupsService } from '../services/prof-groups.service';
import { ProfGroupsPublicService } from '../services/prof-groups.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfGroupsControllerDocs } from '../docs/prof-groups.swagger';

/**
 * Shared Prof Groups Controller — common endpoints accessible by authenticated users.
 * All routes prefixed with /prof-groups
 */
@Controller('prof-groups')
@ProfGroupsControllerDocs.controller()
export class ProfGroupsController {
  constructor(
    private readonly groupsService: ProfGroupsService,
    private readonly groupsPublicService: ProfGroupsPublicService,
  ) {}

  @Get(':id')
  @Public() // Temporarily public - will validate token manually
  @ProfGroupsControllerDocs.findOne()
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
    const authenticatedUser = await this.groupsPublicService.findUserByToken(token);
    if (!authenticatedUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Get the requested group
    return this.groupsService.findById(Number(id));
  }
}
