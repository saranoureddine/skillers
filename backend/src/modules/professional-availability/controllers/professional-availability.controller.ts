import { Controller, Get, Query, Param, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ProfessionalAvailabilityService } from '../services/professional-availability.service';
import { ProfessionalAvailabilityPublicService } from '../services/professional-availability.public.service';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfessionalAvailabilityControllerDocs } from '../docs/professional-availability.swagger';

/**
 * Shared Professional Availability Controller — common endpoints accessible by authenticated users.
 * All routes prefixed with /professional-availability
 */
@Controller('professional-availability')
@ProfessionalAvailabilityControllerDocs.controller()
export class ProfessionalAvailabilityController {
  constructor(
    private readonly availabilityService: ProfessionalAvailabilityService,
    private readonly availabilityPublicService: ProfessionalAvailabilityPublicService,
  ) {}

  @Get()
  @Public() // Temporarily public - will validate token manually if needed
  @ProfessionalAvailabilityControllerDocs.findAll()
  async findAll(@Query() query: PaginationQueryDto) {
    return this.availabilityService.paginate(query);
  }

  @Get(':id')
  @Public() // Temporarily public - will validate token manually
  @ProfessionalAvailabilityControllerDocs.findOne()
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
    const authenticatedUser = await this.availabilityPublicService.findUserByToken(token);
    if (!authenticatedUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Get the requested availability
    return this.availabilityService.findById(Number(id));
  }
}
