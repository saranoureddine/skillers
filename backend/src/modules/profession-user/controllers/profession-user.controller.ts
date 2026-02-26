import { Controller, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ProfessionUserService } from '../services/profession-user.service';
import { ProfessionUserPublicService } from '../services/profession-user.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfessionUserControllerDocs } from '../docs/profession-user.swagger';

/**
 * Shared Profession User Controller — common endpoints accessible by authenticated users.
 * All routes prefixed with /profession-user
 */
@Controller('profession-user')
@ProfessionUserControllerDocs.controller()
export class ProfessionUserController {
  constructor(
    private readonly professionUserService: ProfessionUserService,
    private readonly professionUserPublicService: ProfessionUserPublicService,
  ) {}

  @Get(':id')
  @Public() // Temporarily public - will validate token manually
  @ProfessionUserControllerDocs.findOne()
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
    const authenticatedUser = await this.professionUserPublicService.findUserByToken(token);
    if (!authenticatedUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Get the requested profession user
    return this.professionUserService.findById(Number(id));
  }
}
