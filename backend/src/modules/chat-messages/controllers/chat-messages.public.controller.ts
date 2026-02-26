import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Req,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { ChatMessagesPublicService } from '../services/chat-messages.public.service';
import { CreateChatMessageDto } from '../dto/create-chat-message.dto';
import { UpdateChatMessageDto } from '../dto/update-chat-message.dto';
import { DeleteChatMessageDto } from '../dto/delete-chat-message.dto';
import { GetMessagesBetweenUsersDto } from '../dto/get-messages-between-users.dto';
import { GetPaginatedMessagesDto } from '../dto/get-paginated-messages.dto';
import { UploadAttachmentDto } from '../dto/upload-attachment.dto';
import { DeleteConversationDto } from '../dto/delete-conversation.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ChatMessagesPublicControllerDocs } from '../docs/chat-messages.swagger';

/**
 * Public Chat Messages Controller — handles all public/user-facing endpoints matching Yii API
 * All routes prefixed with /public/chat-messages
 */
@Controller('public/chat-messages')
@ChatMessagesPublicControllerDocs.controller()
export class ChatMessagesPublicController {
  constructor(
    private readonly messagesPublicService: ChatMessagesPublicService,
  ) {}

  @Get('get-all-messages')
  @Public() // Temporarily public - will validate token manually
  @ChatMessagesPublicControllerDocs.getAllMessages()
  async getAllMessages() {
    return this.messagesPublicService.getAllMessages();
  }

  @Get('get-message-by-id/:id')
  @Public() // Temporarily public - will validate token manually
  @ChatMessagesPublicControllerDocs.getMessageById()
  async getMessageById(@Param('id') id: string) {
    return this.messagesPublicService.getMessageById(Number(id));
  }

  @Get('get-messages-between-users')
  @Public() // Temporarily public - will validate token manually
  @ChatMessagesPublicControllerDocs.getMessagesBetweenUsers()
  async getMessagesBetweenUsers(@Query() dto: GetMessagesBetweenUsersDto) {
    return this.messagesPublicService.getMessagesBetweenUsers(dto);
  }

  @Post('create-message')
  @Public() // Temporarily public - will validate token manually
  @ChatMessagesPublicControllerDocs.createMessage()
  async createMessage(@Body() dto: CreateChatMessageDto) {
    return this.messagesPublicService.createMessage(dto);
  }

  @Patch('update-message/:id')
  @Public() // Temporarily public - will validate token manually
  @ChatMessagesPublicControllerDocs.updateMessage()
  async updateMessage(
    @Param('id') id: string,
    @Query('user_id') userId: string,
    @Body() dto: UpdateChatMessageDto,
  ) {
    return this.messagesPublicService.updateMessage(Number(id), userId, dto);
  }

  @Delete('delete-message/:id')
  @Public() // Temporarily public - will validate token manually
  @ChatMessagesPublicControllerDocs.deleteMessage()
  async deleteMessage(@Param('id') id: string, @Query('user_id') userId: string) {
    return this.messagesPublicService.deleteMessage(Number(id), userId);
  }

  @Post('upload-attachment')
  @Public() // Temporarily public - will validate token manually
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  @ChatMessagesPublicControllerDocs.uploadAttachment()
  async uploadAttachment(
    @Body() dto: UploadAttachmentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.messagesPublicService.uploadAttachment(dto, file);
  }

  @Get('get-paginated-messages')
  @Public() // Temporarily public - will validate token manually
  @ChatMessagesPublicControllerDocs.getPaginatedMessages()
  async getPaginatedMessages(@Query() dto: GetPaginatedMessagesDto) {
    return this.messagesPublicService.getPaginatedMessages(dto);
  }

  @Post('delete-conversation')
  @Public() // Temporarily public - will validate token manually
  @ChatMessagesPublicControllerDocs.deleteConversation()
  async deleteConversation(@Body() dto: DeleteConversationDto) {
    return this.messagesPublicService.deleteConversation(dto);
  }
}
