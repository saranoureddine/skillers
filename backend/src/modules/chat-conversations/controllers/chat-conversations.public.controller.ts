import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ChatConversationsPublicService } from '../services/chat-conversations.public.service';
import { CreateChatConversationDto } from '../dto/create-chat-conversation.dto';
import { UpdateChatConversationDto } from '../dto/update-chat-conversation.dto';
import { GetAllUsersDto } from '../dto/get-all-users.dto';
import { MarkConversationReadDto } from '../dto/mark-conversation-read.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ChatConversationsPublicControllerDocs } from '../docs/chat-conversations.swagger';

/**
 * Public Chat Conversations Controller — handles all public/user-facing endpoints matching Yii API
 * All routes prefixed with /public/chat-conversations
 */
@Controller('public/chat-conversations')
@ChatConversationsPublicControllerDocs.controller()
export class ChatConversationsPublicController {
  constructor(
    private readonly conversationsPublicService: ChatConversationsPublicService,
  ) {}

  @Get('get-all-users')
  @Public() // Temporarily public - will validate token manually
  @ChatConversationsPublicControllerDocs.getAllUsers()
  async getAllUsers(@Query() dto: GetAllUsersDto) {
    return this.conversationsPublicService.getAllUsers(dto);
  }

  @Get('get-all-conservations')
  @Public() // Temporarily public - will validate token manually
  @ChatConversationsPublicControllerDocs.getAllConversations()
  async getAllConversations() {
    return this.conversationsPublicService.getAllConversations();
  }

  @Get('get-conservation-by-id/:id')
  @Public() // Temporarily public - will validate token manually
  @ChatConversationsPublicControllerDocs.getConversationById()
  async getConversationById(@Param('id') id: string) {
    return this.conversationsPublicService.getConversationById(Number(id));
  }

  @Post('create-conservation')
  @Public() // Temporarily public - will validate token manually
  @ChatConversationsPublicControllerDocs.createConversation()
  async createConversation(@Body() dto: CreateChatConversationDto) {
    return this.conversationsPublicService.createConversation(dto);
  }

  @Patch('update-conservation/:id')
  @Public() // Temporarily public - will validate token manually
  @ChatConversationsPublicControllerDocs.updateConversation()
  async updateConversation(@Param('id') id: string, @Body() dto: UpdateChatConversationDto) {
    return this.conversationsPublicService.updateConversation(Number(id), dto);
  }

  @Delete('delete-conservation/:id')
  @Public() // Temporarily public - will validate token manually
  @ChatConversationsPublicControllerDocs.deleteConversation()
  async deleteConversation(@Param('id') id: string) {
    return this.conversationsPublicService.deleteConversation(Number(id));
  }

  @Get('get-user-conservations/:user_id')
  @Public() // Temporarily public - will validate token manually
  @ChatConversationsPublicControllerDocs.getUserConversations()
  async getUserConversations(@Param('user_id') userId: string) {
    return this.conversationsPublicService.getUserConversations(userId);
  }

  @Post('mark-conversation-read')
  @Public() // Temporarily public - will validate token manually
  @ChatConversationsPublicControllerDocs.markConversationRead()
  async markConversationRead(@Body() dto: MarkConversationReadDto) {
    return this.conversationsPublicService.markConversationRead(dto);
  }
}
