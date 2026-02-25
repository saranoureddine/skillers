import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserBlocksPublicService } from '../services/user-blocks.public.service';
import { BlockUserDto } from '../dto/block-user.dto';
import { UnblockUserDto } from '../dto/unblock-user.dto';
import { GetBlockedUsersDto } from '../dto/get-blocked-users.dto';
import { CheckIfBlockedDto } from '../dto/check-if-blocked.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { UserBlocksPublicControllerDocs } from '../docs/user-blocks.swagger';

/**
 * Public User Blocks Controller — handles all user blocks endpoints matching Yii API
 * All routes prefixed with /public/user-blocks
 */
@Controller('public/user-blocks')
@UserBlocksPublicControllerDocs.controller()
export class UserBlocksPublicController {
  constructor(
    private readonly userBlocksPublicService: UserBlocksPublicService,
  ) {}

  /**
   * Helper method to extract and validate token
   */
  private async validateToken(req: Request): Promise<string> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.userBlocksPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user.id;
  }

  @Post('block-user')
  @Public() // Temporarily public - will validate token manually
  @UserBlocksPublicControllerDocs.blockUser()
  async blockUser(@Req() req: Request, @Body() dto: BlockUserDto) {
    const blockerId = await this.validateToken(req);
    return this.userBlocksPublicService.blockUser(blockerId, dto);
  }

  @Post('unblock-user')
  @Public() // Temporarily public - will validate token manually
  @UserBlocksPublicControllerDocs.unblockUser()
  async unblockUser(@Req() req: Request, @Body() dto: UnblockUserDto) {
    const blockerId = await this.validateToken(req);
    return this.userBlocksPublicService.unblockUser(blockerId, dto);
  }

  @Post('get-blocked-users')
  @Public() // Temporarily public - will validate token manually
  @UserBlocksPublicControllerDocs.getBlockedUsers()
  async getBlockedUsers(@Req() req: Request, @Body() dto: GetBlockedUsersDto) {
    const userId = await this.validateToken(req);
    return this.userBlocksPublicService.getBlockedUsers(userId, dto);
  }

  @Post('check-if-blocked')
  @Public() // Temporarily public - will validate token manually
  @UserBlocksPublicControllerDocs.checkIfBlocked()
  async checkIfBlocked(@Req() req: Request, @Body() dto: CheckIfBlockedDto) {
    const userId = await this.validateToken(req);
    return this.userBlocksPublicService.checkIfBlocked(userId, dto);
  }
}
