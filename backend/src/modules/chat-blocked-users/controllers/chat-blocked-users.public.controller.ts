import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ChatBlockedUsersPublicService } from '../services/chat-blocked-users.public.service';
import { CreateChatBlockedUserDto } from '../dto/create-chat-blocked-user.dto';
import { UpdateChatBlockedUserDto } from '../dto/update-chat-blocked-user.dto';
import { ToggleBlockDto } from '../dto/toggle-block.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ChatBlockedUsersPublicControllerDocs } from '../docs/chat-blocked-users.swagger';

/**
 * Public Chat Blocked Users Controller — handles all public/user-facing endpoints matching Yii API
 * All routes prefixed with /public/chat-blocked-users
 */
@Controller('public/chat-blocked-users')
@ChatBlockedUsersPublicControllerDocs.controller()
export class ChatBlockedUsersPublicController {
  constructor(
    private readonly blockedUsersPublicService: ChatBlockedUsersPublicService,
  ) {}

  @Get('get-all-blocked')
  @Public() // Temporarily public - will validate token manually
  @ChatBlockedUsersPublicControllerDocs.getAllBlocked()
  async getAllBlocked() {
    return this.blockedUsersPublicService.getAllBlocked();
  }

  @Get('get-blocked-by-id/:id')
  @Public() // Temporarily public - will validate token manually
  @ChatBlockedUsersPublicControllerDocs.getBlockedById()
  async getBlockedById(@Param('id') id: string) {
    return this.blockedUsersPublicService.getBlockedById(Number(id));
  }

  @Post('create-blocked')
  @Public() // Temporarily public - will validate token manually
  @ChatBlockedUsersPublicControllerDocs.createBlocked()
  async createBlocked(@Body() dto: CreateChatBlockedUserDto) {
    return this.blockedUsersPublicService.createBlocked(dto);
  }

  @Patch('update-blocked/:id')
  @Public() // Temporarily public - will validate token manually
  @ChatBlockedUsersPublicControllerDocs.updateBlocked()
  async updateBlocked(@Param('id') id: string, @Body() dto: UpdateChatBlockedUserDto) {
    return this.blockedUsersPublicService.updateBlocked(Number(id), dto);
  }

  @Delete('delete-blocked/:id')
  @Public() // Temporarily public - will validate token manually
  @ChatBlockedUsersPublicControllerDocs.deleteBlocked()
  async deleteBlocked(@Param('id') id: string) {
    return this.blockedUsersPublicService.deleteBlocked(Number(id));
  }

  @Post('toggle-block')
  @Public() // Temporarily public - will validate token manually
  @ChatBlockedUsersPublicControllerDocs.toggleBlock()
  async toggleBlock(@Req() req: Request, @Body() dto: ToggleBlockDto) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    // Find user by token to get blocker ID
    const user = await this.blockedUsersPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return this.blockedUsersPublicService.toggleBlock(user.id, dto);
  }
}
