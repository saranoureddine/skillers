import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProfGroupsPublicService } from '../services/prof-groups.public.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { GetGroupsDto } from '../dto/get-groups.dto';
import { GetGroupDto } from '../dto/get-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { DeleteGroupDto } from '../dto/delete-group.dto';
import { JoinGroupDto } from '../dto/join-group.dto';
import { LeaveGroupDto } from '../dto/leave-group.dto';
import { GetGroupMembersDto } from '../dto/get-group-members.dto';
import { GetUserGroupsDto } from '../dto/get-user-groups.dto';
import { SyncCountsDto } from '../dto/sync-counts.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfGroupsPublicControllerDocs } from '../docs/prof-groups.swagger';

/**
 * Public Prof Groups Controller — handles all public/user-facing endpoints matching Yii API
 * All routes prefixed with /public/prof-groups
 */
@Controller('public/prof-groups')
@ProfGroupsPublicControllerDocs.controller()
export class ProfGroupsPublicController {
  constructor(
    private readonly groupsPublicService: ProfGroupsPublicService,
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

    const user = await this.groupsPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user;
  }

  @Post('create-group')
  @Public()
  @ProfGroupsPublicControllerDocs.createGroup()
  async createGroup(@Body() dto: CreateGroupDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.groupsPublicService.createGroup(dto, user.id, languageCode);
  }

  @Post('get-groups')
  @Public()
  @ProfGroupsPublicControllerDocs.getGroups()
  async getGroups(@Body() dto: GetGroupsDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.groupsPublicService.getGroups(dto, user.id, languageCode);
  }

  @Post('get-group')
  @Public()
  @ProfGroupsPublicControllerDocs.getGroup()
  async getGroup(@Body() dto: GetGroupDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.groupsPublicService.getGroup(dto, user.id, languageCode);
  }

  @Post('update-group')
  @Public()
  @ProfGroupsPublicControllerDocs.updateGroup()
  async updateGroup(@Body() dto: UpdateGroupDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.groupsPublicService.updateGroup(dto, user.id, languageCode);
  }

  @Post('delete-group')
  @Public()
  @ProfGroupsPublicControllerDocs.deleteGroup()
  async deleteGroup(@Body() dto: DeleteGroupDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.groupsPublicService.deleteGroup(dto, user.id, languageCode);
  }

  @Post('join-group')
  @Public()
  @ProfGroupsPublicControllerDocs.joinGroup()
  async joinGroup(@Body() dto: JoinGroupDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.groupsPublicService.joinGroup(dto, user.id, languageCode);
  }

  @Post('leave-group')
  @Public()
  @ProfGroupsPublicControllerDocs.leaveGroup()
  async leaveGroup(@Body() dto: LeaveGroupDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.groupsPublicService.leaveGroup(dto, user.id, languageCode);
  }

  @Post('get-group-members')
  @Public()
  @ProfGroupsPublicControllerDocs.getGroupMembers()
  async getGroupMembers(@Body() dto: GetGroupMembersDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.groupsPublicService.getGroupMembers(dto, user.id, languageCode);
  }

  @Post('get-user-groups')
  @Public()
  @ProfGroupsPublicControllerDocs.getUserGroups()
  async getUserGroups(@Body() dto: GetUserGroupsDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.groupsPublicService.getUserGroups(dto, user.id, languageCode);
  }

  @Post('sync-counts')
  @Public()
  @ProfGroupsPublicControllerDocs.syncCounts()
  async syncCounts(@Body() dto: SyncCountsDto, @Req() req: Request) {
    const user = await this.getAuthenticatedUser(req);
    const languageCode = (req.headers['language'] as string) || 'en';
    return this.groupsPublicService.syncCounts(dto, user.id, languageCode);
  }
}
