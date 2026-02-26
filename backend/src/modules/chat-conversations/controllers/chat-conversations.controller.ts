import { Controller, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ChatConversationsService } from '../services/chat-conversations.service';
import { ChatConversationsPublicService } from '../services/chat-conversations.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ChatConversationsControllerDocs } from '../docs/chat-conversations.swagger';

/**
 * Shared Chat Conversations Controller — common endpoints accessible by authenticated users.
 * All routes prefixed with /chat-conversations
 */
@Controller('chat-conversations')
@ChatConversationsControllerDocs.controller()
export class ChatConversationsController {
  constructor(
    private readonly conversationsService: ChatConversationsService,
    private readonly conversationsPublicService: ChatConversationsPublicService,
  ) {}

  @Get(':id')
  @Public() // Temporarily public - will validate token manually
  @ChatConversationsControllerDocs.findOne()
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
    const authenticatedUser = await this.conversationsPublicService.findUserByToken(token);
    if (!authenticatedUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Get the requested conversation
    return this.conversationsService.findById(Number(id));
  }
}
