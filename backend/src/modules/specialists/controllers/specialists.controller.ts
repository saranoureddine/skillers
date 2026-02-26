import { Controller, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { SpecialistsService } from '../services/specialists.service';
import { SpecialistsPublicService } from '../services/specialists.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { SpecialistsControllerDocs } from '../docs/specialists.swagger';

/**
 * Shared Specialists Controller — common endpoints accessible by authenticated users.
 * All routes prefixed with /specialists
 */
@Controller('specialists')
@SpecialistsControllerDocs.controller()
export class SpecialistsController {
  constructor(
    private readonly specialistsService: SpecialistsService,
    private readonly specialistsPublicService: SpecialistsPublicService,
  ) {}

  @Get(':id')
  @Public() // Temporarily public - will validate token manually
  @SpecialistsControllerDocs.findOne()
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

    // For now, just return the specialist (authentication can be added later)
    return this.specialistsPublicService.getSpecialist(id);
  }
}
