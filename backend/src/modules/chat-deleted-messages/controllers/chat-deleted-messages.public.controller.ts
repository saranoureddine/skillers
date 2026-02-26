import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ChatDeletedMessagesPublicService } from '../services/chat-deleted-messages.public.service';
import { CreateChatDeletedMessageDto } from '../dto/create-chat-deleted-message.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ChatDeletedMessagesPublicControllerDocs } from '../docs/chat-deleted-messages.swagger';

/**
 * Public Chat Deleted Messages Controller — handles all public/user-facing endpoints matching Yii API
 * All routes prefixed with /public/chat-deleted-messages
 */
@Controller('public/chat-deleted-messages')
@ChatDeletedMessagesPublicControllerDocs.controller()
export class ChatDeletedMessagesPublicController {
  constructor(
    private readonly deletedMessagesPublicService: ChatDeletedMessagesPublicService,
  ) {}

  @Get('get-all-deleted')
  @Public() // Temporarily public - will validate token manually
  @ChatDeletedMessagesPublicControllerDocs.getAllDeleted()
  async getAllDeleted() {
    return this.deletedMessagesPublicService.getAllDeleted();
  }

  @Get('get-deleted-by-id/:id')
  @Public() // Temporarily public - will validate token manually
  @ChatDeletedMessagesPublicControllerDocs.getDeletedById()
  async getDeletedById(@Param('id') id: string) {
    return this.deletedMessagesPublicService.getDeletedById(Number(id));
  }

  @Post('create-deleted')
  @Public() // Temporarily public - will validate token manually
  @ChatDeletedMessagesPublicControllerDocs.createDeleted()
  async createDeleted(@Body() dto: CreateChatDeletedMessageDto) {
    return this.deletedMessagesPublicService.createDeleted(dto);
  }
}
