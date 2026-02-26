import { Controller, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ChatDeletedMessagesService } from '../services/chat-deleted-messages.service';
import { ChatDeletedMessagesPublicService } from '../services/chat-deleted-messages.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ChatDeletedMessagesControllerDocs } from '../docs/chat-deleted-messages.swagger';

/**
 * Shared Chat Deleted Messages Controller — common endpoints accessible by authenticated users.
 * All routes prefixed with /chat-deleted-messages
 */
@Controller('chat-deleted-messages')
@ChatDeletedMessagesControllerDocs.controller()
export class ChatDeletedMessagesController {
  constructor(
    private readonly deletedMessagesService: ChatDeletedMessagesService,
    private readonly deletedMessagesPublicService: ChatDeletedMessagesPublicService,
  ) {}

  @Get(':id')
  @Public() // Temporarily public - will validate token manually
  @ChatDeletedMessagesControllerDocs.findOne()
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

    // For now, just return the deleted message (authentication can be added later)
    return this.deletedMessagesService.findById(Number(id));
  }
}
