import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProfFollowPublicService } from '../services/prof-follow.public.service';
import { FollowUserDto } from '../dto/follow-user.dto';
import { UnfollowUserDto } from '../dto/unfollow-user.dto';
import { FollowBlockUserDto } from '../dto/block-user.dto';
import { FollowUnblockUserDto } from '../dto/unblock-user.dto';
import { MuteUserDto } from '../dto/mute-user.dto';
import { UnmuteUserDto } from '../dto/unmute-user.dto';
import { GetFollowersDto } from '../dto/get-followers.dto';
import { GetFollowingDto } from '../dto/get-following.dto';
import { GetFollowStatusDto } from '../dto/get-follow-status.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfFollowPublicControllerDocs } from '../docs/prof-follow.swagger';

/**
 * Public Prof Follow Controller — handles all public/user-facing endpoints matching Yii API
 * All routes prefixed with /public/prof-follow
 */
@Controller('public/prof-follow')
@ProfFollowPublicControllerDocs.controller()
export class ProfFollowPublicController {
  constructor(
    private readonly followPublicService: ProfFollowPublicService,
  ) {}

  private async getAuthenticatedUser(req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.followPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user;
  }

  @Post('follow-user')
  @Public()
  @ProfFollowPublicControllerDocs.followUser()
  async followUser(@Body() dto: FollowUserDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.followPublicService.followUser(dto, user.id, languageCode);
  }

  @Post('unfollow-user')
  @Public()
  @ProfFollowPublicControllerDocs.unfollowUser()
  async unfollowUser(@Body() dto: UnfollowUserDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.followPublicService.unfollowUser(dto, user.id, languageCode);
  }

  @Post('block-user')
  @Public()
  @ProfFollowPublicControllerDocs.blockUser()
  async blockUser(@Body() dto: FollowBlockUserDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.followPublicService.blockUser(dto, user.id, languageCode);
  }

  @Post('unblock-user')
  @Public()
  @ProfFollowPublicControllerDocs.unblockUser()
  async unblockUser(@Body() dto: FollowUnblockUserDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.followPublicService.unblockUser(dto, user.id, languageCode);
  }

  @Post('mute-user')
  @Public()
  @ProfFollowPublicControllerDocs.muteUser()
  async muteUser(@Body() dto: MuteUserDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.followPublicService.muteUser(dto, user.id, languageCode);
  }

  @Post('unmute-user')
  @Public()
  @ProfFollowPublicControllerDocs.unmuteUser()
  async unmuteUser(@Body() dto: UnmuteUserDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.followPublicService.unmuteUser(dto, user.id, languageCode);
  }

  @Post('get-followers')
  @Public()
  @ProfFollowPublicControllerDocs.getFollowers()
  async getFollowers(@Body() dto: GetFollowersDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.followPublicService.getFollowers(dto, user.id, languageCode);
  }

  @Post('get-following')
  @Public()
  @ProfFollowPublicControllerDocs.getFollowing()
  async getFollowing(@Body() dto: GetFollowingDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.followPublicService.getFollowing(dto, user.id, languageCode);
  }

  @Post('get-follow-status')
  @Public()
  @ProfFollowPublicControllerDocs.getFollowStatus()
  async getFollowStatus(@Body() dto: GetFollowStatusDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.followPublicService.getFollowStatus(dto, user.id, languageCode);
  }
}
