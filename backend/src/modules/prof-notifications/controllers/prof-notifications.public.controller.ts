import {
  Body,
  Controller,
  Post,
  Req,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProfNotificationsPublicService } from '../services/prof-notifications.public.service';
import { Public } from '../../../common/decorators/public.decorator';
import { ProfNotificationsPublicControllerDocs } from '../docs/prof-notifications.swagger';
import {
  GetNotificationsDto,
  MarkAsReadDto,
  DeleteNotificationDto,
  GetNotificationsByTypeDto,
  UpdateNotificationPreferencesDto,
} from '../dto';

/**
 * Public ProfNotifications Controller — handles all professional notifications endpoints matching Yii API
 * All routes prefixed with /public/prof-notifications
 */
@Controller('public/prof-notifications')
@ProfNotificationsPublicControllerDocs.controller()
export class ProfNotificationsPublicController {
  constructor(
    private readonly profNotificationsPublicService: ProfNotificationsPublicService,
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

    const user = await this.profNotificationsPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user.id;
  }

  @Post('get-notifications')
  @Public() // Temporarily public - will validate token manually
  @ProfNotificationsPublicControllerDocs.getNotifications()
  async getNotifications(
    @Req() req: Request,
    @Body() dto: GetNotificationsDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profNotificationsPublicService.getNotifications(userId, dto, languageCode || 'en');
  }

  @Post('get-unread-count')
  @Public() // Temporarily public - will validate token manually
  @ProfNotificationsPublicControllerDocs.getUnreadCount()
  async getUnreadCount(
    @Req() req: Request,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profNotificationsPublicService.getUnreadCount(userId, languageCode || 'en');
  }

  @Post('mark-as-read')
  @Public() // Temporarily public - will validate token manually
  @ProfNotificationsPublicControllerDocs.markAsRead()
  async markAsRead(
    @Req() req: Request,
    @Body() dto: MarkAsReadDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profNotificationsPublicService.markAsRead(userId, dto, languageCode || 'en');
  }

  @Post('mark-all-as-read')
  @Public() // Temporarily public - will validate token manually
  @ProfNotificationsPublicControllerDocs.markAllAsRead()
  async markAllAsRead(
    @Req() req: Request,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profNotificationsPublicService.markAllAsRead(userId, languageCode || 'en');
  }

  @Post('delete-notification')
  @Public() // Temporarily public - will validate token manually
  @ProfNotificationsPublicControllerDocs.deleteNotification()
  async deleteNotification(
    @Req() req: Request,
    @Body() dto: DeleteNotificationDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profNotificationsPublicService.deleteNotification(userId, dto, languageCode || 'en');
  }

  @Post('clear-all-notifications')
  @Public() // Temporarily public - will validate token manually
  @ProfNotificationsPublicControllerDocs.clearAllNotifications()
  async clearAllNotifications(
    @Req() req: Request,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profNotificationsPublicService.clearAllNotifications(userId, languageCode || 'en');
  }

  @Post('get-notifications-by-type')
  @Public() // Temporarily public - will validate token manually
  @ProfNotificationsPublicControllerDocs.getNotificationsByType()
  async getNotificationsByType(
    @Req() req: Request,
    @Body() dto: GetNotificationsByTypeDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profNotificationsPublicService.getNotificationsByType(userId, dto, languageCode || 'en');
  }

  @Post('get-notification-preferences')
  @Public() // Temporarily public - will validate token manually
  @ProfNotificationsPublicControllerDocs.getNotificationPreferences()
  async getNotificationPreferences(
    @Req() req: Request,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profNotificationsPublicService.getNotificationPreferences(userId, languageCode || 'en');
  }

  @Post('update-notification-preferences')
  @Public() // Temporarily public - will validate token manually
  @ProfNotificationsPublicControllerDocs.updateNotificationPreferences()
  async updateNotificationPreferences(
    @Req() req: Request,
    @Body() dto: UpdateNotificationPreferencesDto,
    @Headers('Language') languageCode?: string,
  ) {
    const userId = await this.validateToken(req);
    return this.profNotificationsPublicService.updateNotificationPreferences(
      userId,
      dto,
      languageCode || 'en',
    );
  }
}
