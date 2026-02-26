import { Controller, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ChatMessagesService } from '../services/chat-messages.service';
import { ChatMessagesPublicService } from '../services/chat-messages.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ChatMessagesControllerDocs } from '../docs/chat-messages.swagger';

/**
 * Shared Chat Messages Controller — common endpoints accessible by authenticated users.
 * All routes prefixed with /chat-messages
 */
@Controller('chat-messages')
@ChatMessagesControllerDocs.controller()
export class ChatMessagesController {
  constructor(
    private readonly messagesService: ChatMessagesService,
    private readonly messagesPublicService: ChatMessagesPublicService,
  ) {}

  @Get(':id')
  @Public() // Temporarily public - will validate token manually
  @ChatMessagesControllerDocs.findOne()
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
    const authenticatedUser = await this.messagesPublicService.findUserByToken(token);
    if (!authenticatedUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Get the requested message
    return this.messagesService.findById(Number(id));
  }
}
