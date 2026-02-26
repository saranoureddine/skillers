import { Controller, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ChatBlockedUsersService } from '../services/chat-blocked-users.service';
import { ChatBlockedUsersPublicService } from '../services/chat-blocked-users.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ChatBlockedUsersControllerDocs } from '../docs/chat-blocked-users.swagger';

/**
 * Shared Chat Blocked Users Controller — common endpoints accessible by authenticated users.
 * All routes prefixed with /chat-blocked-users
 */
@Controller('chat-blocked-users')
@ChatBlockedUsersControllerDocs.controller()
export class ChatBlockedUsersController {
  constructor(
    private readonly blockedUsersService: ChatBlockedUsersService,
    private readonly blockedUsersPublicService: ChatBlockedUsersPublicService,
  ) {}

  @Get(':id')
  @Public() // Temporarily public - will validate token manually
  @ChatBlockedUsersControllerDocs.findOne()
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
    const authenticatedUser = await this.blockedUsersPublicService.findUserByToken(token);
    if (!authenticatedUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Get the requested blocked user
    return this.blockedUsersService.findById(Number(id));
  }
}
