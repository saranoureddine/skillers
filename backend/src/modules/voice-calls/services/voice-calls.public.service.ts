import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { VoiceCallEntity } from '../entities/voice-call.entity';
import { UserEntity } from '../../users/entities/user.entity';
import {
  InitiateCallDto,
  AcceptCallDto,
  DeclineCallDto,
  DismissCallDto,
  EndCallDto,
  EndCallsBetweenUsersDto,
  CallStatusDto,
  GetVoiceCallsDto,
  GetUserCallsDto,
  MissedCallDto,
  DeleteCallDto,
  UpdatePlatformDto,
  UpdateVoipTokenDto,
  TestFcmDeliveryDto,
  ConfirmCallDeliveryDto,
  SendMissedCallNotificationDto,
  TestVoipPushDto,
  DebugFcmDto,
} from '../dto';
import { AgoraService } from './agora.service';
import { NotificationService } from './notification.service';
import * as crypto from 'crypto';

/**
 * Public/user-facing service — handles all voice call endpoints matching Yii API
 */
@Injectable()
export class VoiceCallsPublicService {
  private lastNotificationResult: any = null;

  constructor(
    @InjectRepository(VoiceCallEntity)
    private readonly voiceCallsRepository: Repository<VoiceCallEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find user by token (for authentication)
   */
  async findUserByToken(token: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { token, isActivated: 1 },
    });
  }

  /**
   * Generate unique call ID
   */
  private generateCallId(): string {
    return `call_${crypto.randomBytes(10).toString('hex')}_${Date.now()}`;
  }

  /**
   * Generate stable numeric UID from string user ID (using CRC32)
   */
  private generateNumericUid(userId: string): number {
    // Simple hash function to convert string to number
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) || 1;
  }

  /**
   * Get user info for API responses
   */
  private async getUserInfo(user: UserEntity): Promise<any> {
    const id = user.id;
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const name = `${firstName} ${lastName}`.trim();
    const email = user.email || null;

    // Get user image from ag_attachment table (table_name = 210, type = 1)
    const userImage = await this.dataSource
      .createQueryBuilder()
      .select('file_path')
      .from('ag_attachment', 'att')
      .where('att.table_name = :tableName', { tableName: 210 })
      .andWhere('att.type = :type', { type: 1 })
      .andWhere('att.row_id = :rowId', { rowId: id })
      .limit(1)
      .getRawOne();

    let avatar: string | null = null;
    if (userImage && userImage.file_path) {
      const filePath = userImage.file_path;
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        avatar = filePath;
      } else {
        // TODO: Get base URL from config
        avatar = `http://localhost/${filePath}`;
      }
    }

    return {
      id,
      name,
      avatar,
      email,
    };
  }

  /**
   * Convert file path to public URL
   */
  private toPublicUrl(filePath: string | null): string | null {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    // TODO: Get base URL from config
    const base = 'http://localhost';
    return `${base}/${filePath.replace(/^\/+/, '')}`;
  }

  /**
   * Find active call between two users
   */
  private async findActiveCallBetween(
    userId1: string,
    userId2: string,
  ): Promise<VoiceCallEntity | null> {
    return this.voiceCallsRepository
      .createQueryBuilder('call')
      .where(
        '(call.callerId = :userId1 AND call.receiverId = :userId2) OR (call.callerId = :userId2 AND call.receiverId = :userId1)',
        { userId1, userId2 },
      )
      .andWhere('call.endedAt IS NULL')
      .andWhere('call.status IN (:...statuses)', {
        statuses: ['initiated', 'ringing', 'accepted'],
      })
      .orderBy('call.createdAt', 'DESC')
      .getOne();
  }

  /**
   * Send voice call notification
   */
  private async sendVoiceCallNotification(
    recipient: UserEntity,
    sender: UserEntity,
    call: VoiceCallEntity,
    eventType: string,
  ): Promise<void> {
    try {
      // Check if user has disabled receiving calls
      if (
        eventType === 'incoming_call' &&
        recipient.receiveCalls !== undefined &&
        recipient.receiveCalls === 0
      ) {
        this.lastNotificationResult = {
          fcm_accepted: false,
          ringing_started: false,
          delivery_info: {
            success_rate: 0,
            successful_deliveries: 0,
            failed_deliveries: 1,
            total_sent: 1,
            note: 'User has disabled call notifications',
          },
          fcm_result: null,
        };
        return;
      }

      // Skip if recipient doesn't have FCM token
      if (!recipient.fcmToken) {
        this.lastNotificationResult = {
          fcm_accepted: false,
          ringing_started: false,
          delivery_info: {
            success_rate: 0,
            successful_deliveries: 0,
            failed_deliveries: 1,
            total_sent: 1,
            note: 'No FCM token available for user',
          },
          fcm_result: null,
        };
        return;
      }

      const senderInfo = await this.getUserInfo(sender);
      const senderName = senderInfo.name || 'Someone';

      // Generate voice credentials for the recipient
      const recipientUid = this.generateNumericUid(recipient.id);
      let voiceCredentials: any = {};

      // Only include voice credentials for incoming calls
      if (eventType === 'incoming_call') {
        try {
          const token = AgoraService.generateToken(
            call.channelName,
            recipientUid,
          );
          voiceCredentials = {
            token,
            app_id: AgoraService.getAppId(),
            receiver_uid: recipientUid,
            uid: recipientUid,
            expires_in: AgoraService.getTokenExpiry(),
          };
        } catch (e) {
          // Log warning but continue
        }
      }

      // Prepare notification content
      const callTypeText =
        call.type === 'video' ? 'Video' : 'Voice';
      let title = '';
      let body = '';

      switch (eventType) {
        case 'incoming_call':
          title = `Incoming ${callTypeText} Call`;
          body = `${senderName} is calling you`;
          break;
        case 'call_accepted':
          title = `${callTypeText} Call Accepted`;
          body = `${senderName} accepted your ${callTypeText} call`;
          break;
        case 'call_declined':
          title = `${callTypeText} Call Declined`;
          body = `${senderName} declined your ${callTypeText} call`;
          break;
        case 'call_ended':
          title = `${callTypeText} Call Ended`;
          body = `${senderName} ended the ${callTypeText} call`;
          break;
        default:
          title = `${callTypeText} Call`;
          body = `${callTypeText} call update from ${senderName}`;
      }

      // Prepare data payload
      const dataPayload: any = {
        call_type: call.type,
        event_type: eventType === 'incoming_call' ? 'call_invite' : eventType,
        call_id: call.callId,
        channel_name: call.channelName,
        sender_id: sender.id,
        sender_name: senderName,
        sender_avatar: senderInfo.avatar || '',
        receiver_id: recipient.id,
        caller_uid: this.generateNumericUid(call.callerId),
        receiver_uid: recipientUid,
        timestamp: new Date().toISOString(),
      };

      // Add voice credentials for incoming calls
      if (eventType === 'incoming_call' && Object.keys(voiceCredentials).length > 0) {
        Object.assign(dataPayload, {
          token: voiceCredentials.token,
          app_id: voiceCredentials.app_id,
          expires_in: voiceCredentials.expires_in,
        });
      }

      // Send VoIP notification for incoming calls
      let result: any = null;
      if (eventType === 'incoming_call') {
        result = await NotificationService.SendVoipCallNotification(
          recipient.fcmToken,
          {
            call_type: call.type,
            call_id: call.callId,
            channel_name: call.channelName,
            token: voiceCredentials.token || '',
            app_id: voiceCredentials.app_id || '',
            caller_uid: this.generateNumericUid(call.callerId),
            receiver_uid: recipientUid,
            sender_id: sender.id,
            receiver_id: recipient.id,
            sender_name: senderName,
            receiver_name: `${recipient.firstName} ${recipient.lastName}`,
            sender_avatar: senderInfo.avatar || '',
            receiver_avatar: '',
          },
          recipient.id,
        );
      } else {
        // Send regular notification for status updates
        result = await NotificationService.SendDataOnlyMessage(
          recipient.fcmToken,
          dataPayload,
          recipient.id,
        );
      }

      // Store delivery information
      this.lastNotificationResult = {
        fcm_accepted: result?.fcm_accepted || false,
        ringing_started: result?.fcm_accepted || false,
        delivery_info: result?.delivery_info || null,
        fcm_result: result,
      };
    } catch (error) {
      // Log error but don't fail the call
      console.error('Voice call notification error:', error);
    }
  }

  /**
   * Initiate a voice call (actionInitiateCall)
   */
  async initiateCall(
    callerId: string,
    dto: InitiateCallDto,
  ): Promise<any> {
    try {
      const receiverId = dto.receiverId;
      const callType = dto.type || 'voice';

      // Validate call type
      if (!['voice', 'video'].includes(callType)) {
        throw new BadRequestException(
          'Invalid call type. Must be "voice" or "video"',
        );
      }

      // Auto-generate stable numeric UIDs
      const callerUid = this.generateNumericUid(callerId);
      const receiverUid = this.generateNumericUid(receiverId);

      // Check if receiver exists
      const receiver = await this.usersRepository.findOne({
        where: { id: receiverId },
      });
      if (!receiver) {
        throw new NotFoundException('Receiver not found');
      }

      // TODO: Create conversation if it doesn't exist (ChatConservation model)

      // Check if there's already an active call between these users
      const existingCall = await this.findActiveCallBetween(
        callerId,
        receiverId,
      );
      if (existingCall) {
        return {
          success: false,
          message: 'There is already an active call between these users',
          existing_call: {
            call_id: existingCall.callId,
            status: existingCall.status,
          },
        };
      }

      // Check if caller is already on another call
      const callerActiveCall = await this.voiceCallsRepository
        .createQueryBuilder('call')
        .where(
          '(call.callerId = :userId OR call.receiverId = :userId)',
          { userId: callerId },
        )
        .andWhere('call.endedAt IS NULL')
        .andWhere('call.status NOT IN (:...statuses)', {
          statuses: ['declined', 'ended', 'missed'],
        })
        .getOne();

      if (callerActiveCall) {
        return {
          success: false,
          message: 'You are already on another call',
          reason: 'caller_busy',
          active_call: {
            call_id: callerActiveCall.callId,
            status: callerActiveCall.status,
          },
        };
      }

      // Check if receiver is already on another call
      const receiverActiveCall = await this.voiceCallsRepository
        .createQueryBuilder('call')
        .where(
          '(call.callerId = :userId OR call.receiverId = :userId)',
          { userId: receiverId },
        )
        .andWhere('call.endedAt IS NULL')
        .getOne();

      if (receiverActiveCall) {
        const receiverName = `${receiver.firstName || ''} ${receiver.lastName || ''}`.trim();
        return {
          success: false,
          message: receiverName
            ? `${receiverName} is on another call`
            : 'User is on another call',
          reason: 'receiver_busy',
          receiver_name: receiverName || 'User',
          active_call: {
            call_id: receiverActiveCall.callId,
            status: receiverActiveCall.status,
          },
        };
      }

      // Generate call credentials
      const credentials = AgoraService.generateCallCredentials(
        callerId,
        receiverId,
        callerUid,
        receiverUid,
      );

      // Create call record
      const voiceCall = this.voiceCallsRepository.create({
        callId: this.generateCallId(),
        callerId,
        receiverId,
        channelName: credentials.channel_name,
        type: callType,
        status: 'initiated',
      } as Partial<VoiceCallEntity>);

      await this.voiceCallsRepository.save(voiceCall);

      // Get caller user for notification
      const caller = await this.usersRepository.findOne({
        where: { id: callerId },
      });

      // Send push notification to receiver
      if (caller) {
        await this.sendVoiceCallNotification(
          receiver,
          caller,
          voiceCall,
          'incoming_call',
        );
      }

      // Prepare response
      const response: any = {
        success: true,
        call_id: voiceCall.callId,
        channel_name: credentials.channel_name,
        token: credentials.caller_token,
        app_id: credentials.app_id,
        type: callType,
        receiver: await this.getUserInfo(receiver),
        expires_in: credentials.expires_in,
        caller_uid: credentials.caller_uid,
        receiver_uid: credentials.receiver_uid,
        uid: credentials.caller_uid, // For backward compatibility
      };

      // Add notification status if available
      if (this.lastNotificationResult !== null) {
        response.notification_status = {
          fcm_accepted: this.lastNotificationResult.fcm_accepted,
          fcm_message_sent: this.lastNotificationResult.fcm_accepted,
          delivery_info: this.lastNotificationResult.delivery_info,
          explanation:
            'fcm_accepted=true means Google FCM accepted the message. Actual device delivery depends on device connectivity, app state, and network conditions.',
        };

        if (!this.lastNotificationResult.fcm_accepted) {
          response.warning =
            'Call initiated but FCM rejected notification - check receiver FCM token validity';
        } else {
          response.info =
            'Call notification sent to FCM. Device will ring when online and app is properly configured.';
        }

        response.ringing_status = {
          ringing_started: this.lastNotificationResult.ringing_started,
          notification_delivered: this.lastNotificationResult.fcm_accepted,
          delivery_info: this.lastNotificationResult.delivery_info,
        };
      }

      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to initiate call: ' + error.message,
      );
    }
  }

  /**
   * Accept an incoming voice call (actionAcceptCall)
   */
  async acceptCall(userId: string, dto: AcceptCallDto): Promise<any> {
    try {
      const call = await this.voiceCallsRepository.findOne({
        where: { callId: dto.callId },
      });

      if (!call) {
        throw new NotFoundException('Call not found');
      }

      // Verify user is the receiver
      if (call.receiverId !== userId) {
        throw new UnauthorizedException(
          'You are not authorized to accept this call',
        );
      }

      // Check if call is still active
      if (!['initiated', 'ringing'].includes(call.status)) {
        return {
          success: false,
          message: 'Call is no longer active',
          status: call.status,
        };
      }

      // Update call status
      call.status = 'accepted';
      call.startedAt = new Date();
      await this.voiceCallsRepository.save(call);

      // Send push notification to caller about call acceptance
      const caller = await this.usersRepository.findOne({
        where: { id: call.callerId },
      });
      const receiver = await this.usersRepository.findOne({
        where: { id: call.receiverId },
      });

      if (caller && receiver) {
        await this.sendVoiceCallNotification(
          caller,
          receiver,
          call,
          'call_accepted',
        );
      }

      // Generate fresh token for the receiver
      const receiverUid = this.generateNumericUid(userId);
      const receiverToken = AgoraService.generateToken(
        call.channelName,
        receiverUid,
      );

      return {
        success: true,
        message: 'Call accepted',
        call_id: dto.callId,
        channel_name: call.channelName,
        token: receiverToken,
        app_id: AgoraService.getAppId(),
        type: call.type,
        status: call.status,
        receiver_uid: receiverUid,
        uid: receiverUid, // For backward compatibility
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to accept call: ' + error.message,
      );
    }
  }

  /**
   * Decline an incoming voice call (actionDeclineCall)
   */
  async declineCall(userId: string, dto: DeclineCallDto): Promise<any> {
    try {
      const call = await this.voiceCallsRepository.findOne({
        where: { callId: dto.callId },
      });

      if (!call) {
        throw new NotFoundException('Call not found');
      }

      // Verify user is the receiver
      if (call.receiverId !== userId) {
        throw new UnauthorizedException(
          'You are not authorized to decline this call',
        );
      }

      // Update call status
      call.status = 'declined';
      await this.voiceCallsRepository.save(call);

      // Send push notification to caller about call decline
      const caller = await this.usersRepository.findOne({
        where: { id: call.callerId },
      });
      const receiver = await this.usersRepository.findOne({
        where: { id: call.receiverId },
      });

      if (caller && receiver) {
        await this.sendVoiceCallNotification(
          caller,
          receiver,
          call,
          'call_declined',
        );
      }

      return {
        success: true,
        message: 'Call declined',
        call_id: dto.callId,
        type: call.type,
        status: call.status,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to decline call: ' + error.message,
      );
    }
  }

  /**
   * Dismiss (busy) an incoming call (actionDismissCall)
   */
  async dismissCall(dto: DismissCallDto): Promise<any> {
    try {
      const call = await this.voiceCallsRepository.findOne({
        where: { callId: dto.callId },
      });

      if (!call) {
        throw new NotFoundException('Call not found');
      }

      // Only dismiss if not yet started
      if (!['initiated', 'ringing'].includes(call.status)) {
        return {
          success: false,
          message: 'Call can no longer be dismissed',
          status: call.status,
        };
      }

      // Mark declined or ended
      try {
        call.status = 'declined';
        await this.voiceCallsRepository.save(call);
      } catch (e) {
        call.status = 'ended';
        call.endedAt = new Date();
        await this.voiceCallsRepository.save(call);
      }

      // Notify caller with terminal event
      const caller = await this.usersRepository.findOne({
        where: { id: call.callerId },
      });
      const receiver = await this.usersRepository.findOne({
        where: { id: call.receiverId },
      });

      if (caller && caller.fcmToken) {
        const event = {
          event_type: 'call_dismissed',
          call_id: call.callId,
          call_type: call.type,
          sender_id: receiver?.id || '',
          receiver_id: caller.id,
          sender_name: receiver
            ? `${receiver.firstName || ''} ${receiver.lastName || ''}`.trim()
            : '',
          receiver_name: `${caller.firstName || ''} ${caller.lastName || ''}`.trim(),
          timestamp: Math.floor(Date.now() / 1000).toString(),
        };
        await NotificationService.SendTerminalEvent(caller.fcmToken, event);
      }

      return {
        success: true,
        message: 'Call dismissed',
        call_id: dto.callId,
        type: call.type,
        status: call.status,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to dismiss call: ' + error.message,
      );
    }
  }

  /**
   * End an active voice call (actionEndCall)
   */
  async endCall(userId: string, dto: EndCallDto): Promise<any> {
    try {
      const call = await this.voiceCallsRepository.findOne({
        where: { callId: dto.callId },
      });

      if (!call) {
        throw new NotFoundException('Call not found');
      }

      // Verify user is part of the call
      if (call.callerId !== userId && call.receiverId !== userId) {
        throw new UnauthorizedException('You are not part of this call');
      }

      // End the call
      call.status = 'ended';
      call.endedAt = new Date();

      // Calculate duration if call was started
      if (call.startedAt) {
        call.duration = Math.floor(
          (call.endedAt.getTime() - call.startedAt.getTime()) / 1000,
        );
      }

      await this.voiceCallsRepository.save(call);

      // Send push notification to the other participant
      const otherUserId =
        call.callerId === userId ? call.receiverId : call.callerId;
      const otherUser = await this.usersRepository.findOne({
        where: { id: otherUserId },
      });
      const currentUser = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (otherUser && currentUser) {
        await this.sendVoiceCallNotification(
          otherUser,
          currentUser,
          call,
          'call_ended',
        );
      }

      // Format duration
      const minutes = Math.floor(call.duration / 60);
      const seconds = call.duration % 60;
      const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      return {
        success: true,
        message: 'Call ended',
        call_id: dto.callId,
        type: call.type,
        duration: call.duration,
        formatted_duration: formattedDuration,
        status: call.status,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to end call: ' + error.message,
      );
    }
  }

  /**
   * End all active calls (actionEndAllCalls) - Admin action
   */
  async endAllCalls(): Promise<any> {
    try {
      const calls = await this.voiceCallsRepository.find({
        where: { endedAt: null as any },
      });

      const ended: any[] = [];
      const errors: any[] = [];

      for (const call of calls) {
        try {
          call.status = 'ended';
          call.endedAt = new Date();
          if (call.startedAt) {
            call.duration = Math.floor(
              (call.endedAt.getTime() - call.startedAt.getTime()) / 1000,
            );
          }
          await this.voiceCallsRepository.save(call);

          const minutes = Math.floor(call.duration / 60);
          const seconds = call.duration % 60;
          const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

          ended.push({
            call_id: call.callId,
            channel_name: call.channelName,
            status: call.status,
            caller_id: call.callerId,
            receiver_id: call.receiverId,
            duration: call.duration,
            formatted_duration: formattedDuration,
          });
        } catch (e: any) {
          errors.push({
            call_id: call.callId,
            error: e.message,
          });
        }
      }

      return {
        success: errors.length === 0,
        ended_count: ended.length,
        ended_calls: ended,
        errors,
        admin_action: true,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to end all calls: ' + error.message,
      );
    }
  }

  /**
   * End all active calls for a specific user (actionEndAllCallsForUser)
   */
  async endAllCallsForUser(userId: string): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const calls = await this.voiceCallsRepository
        .createQueryBuilder('call')
        .where(
          '(call.callerId = :userId OR call.receiverId = :userId)',
          { userId },
        )
        .andWhere('call.endedAt IS NULL')
        .getMany();

      const ended: any[] = [];
      const errors: any[] = [];

      for (const call of calls) {
        try {
          call.status = 'ended';
          call.endedAt = new Date();
          if (call.startedAt) {
            call.duration = Math.floor(
              (call.endedAt.getTime() - call.startedAt.getTime()) / 1000,
            );
          }
          await this.voiceCallsRepository.save(call);

          const otherUserId =
            call.callerId === userId ? call.receiverId : call.callerId;

          const minutes = Math.floor(call.duration / 60);
          const seconds = call.duration % 60;
          const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

          ended.push({
            call_id: call.callId,
            channel_name: call.channelName,
            status: call.status,
            other_user_id: otherUserId,
            duration: call.duration,
            formatted_duration: formattedDuration,
          });
        } catch (e: any) {
          errors.push({
            call_id: call.callId,
            error: e.message,
          });
        }
      }

      return {
        success: errors.length === 0,
        ended_count: ended.length,
        ended_calls: ended,
        user: await this.getUserInfo(user),
        errors,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to end calls for user: ' + error.message,
      );
    }
  }

  /**
   * End all active calls between two users (actionEndCallsBetweenUsers)
   */
  async endCallsBetweenUsers(
    userId: string,
    dto: EndCallsBetweenUsersDto,
  ): Promise<any> {
    try {
      const otherUser = await this.usersRepository.findOne({
        where: { id: dto.otherUserId },
      });
      if (!otherUser) {
        throw new NotFoundException('Other user not found');
      }

      const calls = await this.voiceCallsRepository
        .createQueryBuilder('call')
        .where(
          '(call.callerId = :userId AND call.receiverId = :otherUserId) OR (call.callerId = :otherUserId AND call.receiverId = :userId)',
          { userId, otherUserId: dto.otherUserId },
        )
        .andWhere('call.endedAt IS NULL')
        .getMany();

      const ended: any[] = [];
      const errors: any[] = [];

      for (const call of calls) {
        try {
          call.status = 'ended';
          call.endedAt = new Date();
          if (call.startedAt) {
            call.duration = Math.floor(
              (call.endedAt.getTime() - call.startedAt.getTime()) / 1000,
            );
          }
          await this.voiceCallsRepository.save(call);

          const minutes = Math.floor(call.duration / 60);
          const seconds = call.duration % 60;
          const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

          ended.push({
            call_id: call.callId,
            channel_name: call.channelName,
            status: call.status,
            caller_id: call.callerId,
            receiver_id: call.receiverId,
            duration: call.duration,
            formatted_duration: formattedDuration,
          });
        } catch (e: any) {
          errors.push({
            call_id: call.callId,
            error: e.message,
          });
        }
      }

      return {
        success: errors.length === 0,
        ended_count: ended.length,
        ended_calls: ended,
        other_user: await this.getUserInfo(otherUser),
        errors,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to end calls between users: ' + error.message,
      );
    }
  }

  /**
   * Get call status (actionCallStatus)
   */
  async getCallStatus(userId: string, dto: CallStatusDto): Promise<any> {
    try {
      const call = await this.voiceCallsRepository.findOne({
        where: { callId: dto.callId },
      });

      if (!call) {
        throw new NotFoundException('Call not found');
      }

      // Verify user is part of the call
      if (call.callerId !== userId && call.receiverId !== userId) {
        throw new UnauthorizedException('You are not part of this call');
      }

      const caller = await this.usersRepository.findOne({
        where: { id: call.callerId },
      });
      const receiver = await this.usersRepository.findOne({
        where: { id: call.receiverId },
      });

      const isActive = ['initiated', 'ringing', 'accepted'].includes(
        call.status,
      );
      const isCompleted = ['declined', 'ended', 'missed'].includes(
        call.status,
      );

      const minutes = Math.floor(call.duration / 60);
      const seconds = call.duration % 60;
      const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      return {
        success: true,
        call: {
          call_id: call.callId,
          type: call.type,
          status: call.status,
          channel_name: call.channelName,
          duration: call.duration,
          formatted_duration: formattedDuration,
          started_at: call.startedAt,
          ended_at: call.endedAt,
          created_at: call.createdAt,
          is_active: isActive,
          is_completed: isCompleted,
          caller: caller ? await this.getUserInfo(caller) : null,
          receiver: receiver ? await this.getUserInfo(receiver) : null,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to get call status: ' + error.message,
      );
    }
  }

  /**
   * Get voice calls for a chat conversation (actionGetVoiceCalls)
   */
  async getVoiceCalls(
    userId: string,
    dto: GetVoiceCallsDto,
  ): Promise<any> {
    try {
      let userOne: string | undefined;
      let userTwo: string | undefined;

      // If chat_id is provided, get participants from chat conversation
      if (dto.chatId) {
        // TODO: Implement ChatConservation lookup
        // For now, require user_one and user_two
        throw new BadRequestException(
          'chat_id lookup not yet implemented. Please provide user_one and user_two.',
        );
      } else {
        if (!dto.userOne || !dto.userTwo) {
          throw new BadRequestException(
            'Either chat_id or both user_one and user_two are required',
          );
        }
        userOne = dto.userOne;
        userTwo = dto.userTwo;
      }

      // Verify authenticated user is one of the participants
      if (userId !== userOne && userId !== userTwo) {
        throw new UnauthorizedException(
          'You are not authorized to view calls between these users',
        );
      }

      // Get all voice calls between these two users
      const calls = await this.voiceCallsRepository
        .createQueryBuilder('call')
        .where(
          '(call.callerId = :userOne AND call.receiverId = :userTwo) OR (call.callerId = :userTwo AND call.receiverId = :userOne)',
          { userOne, userTwo },
        )
        .orderBy('call.createdAt', 'DESC')
        .getMany();

      const callHistory = calls.map((call) => ({
        chat_id: dto.chatId || null,
        init_call_user_id: call.callerId,
        receiver_id: call.receiverId,
        type: call.type,
        duration: call.duration,
        started_at: call.startedAt,
        ended_at: call.endedAt,
        status: call.status,
      }));

      return {
        success: true,
        calls: callHistory,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to get voice calls: ' + error.message,
      );
    }
  }

  /**
   * Get all calls for a user (actionGetUserCalls)
   */
  async getUserCalls(
    userId: string,
    dto: GetUserCallsDto,
  ): Promise<any> {
    try {
      const page = Math.max(1, dto.page || 1);
      const limit = Math.min(100, Math.max(1, dto.limit || 20));
      const offset = (page - 1) * limit;

      // Get total count
      const totalCount = await this.voiceCallsRepository
        .createQueryBuilder('call')
        .where(
          '(call.callerId = :userId OR call.receiverId = :userId)',
          { userId },
        )
        .getCount();

      // Get paginated calls
      const calls = await this.voiceCallsRepository
        .createQueryBuilder('call')
        .where(
          '(call.callerId = :userId OR call.receiverId = :userId)',
          { userId },
        )
        .orderBy('call.createdAt', 'DESC')
        .limit(limit)
        .offset(offset)
        .getMany();

      const callHistory: any[] = [];

      for (const call of calls) {
        const isCaller = call.callerId === userId;
        const otherUserId = isCaller ? call.receiverId : call.callerId;

        // Get other user info
        const otherUser = await this.usersRepository.findOne({
          where: { id: otherUserId },
        });

        let otherUserName = 'Unknown';
        let otherUserImage: string | null = null;

        if (otherUser) {
          otherUserName = `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim();

          // Get user's profile image
          const userImage = await this.dataSource
            .createQueryBuilder()
            .select('file_path')
            .from('ag_attachment', 'att')
            .where('att.table_name = :tableName', { tableName: 210 })
            .andWhere('att.type = :type', { type: 1 })
            .andWhere('att.row_id = :rowId', { rowId: otherUserId })
            .limit(1)
            .getRawOne();

          if (userImage && userImage.file_path) {
            otherUserImage = this.toPublicUrl(userImage.file_path);
          }
        }

        const minutes = Math.floor(call.duration / 60);
        const seconds = call.duration % 60;
        const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        callHistory.push({
          call_id: call.callId,
          type: call.type,
          status: call.status,
          direction: isCaller ? 'outgoing' : 'incoming',
          other_user_id: otherUserId,
          other_user_name: otherUserName,
          other_user_image: otherUserImage,
          duration: call.duration,
          formatted_duration: formattedDuration,
          created_at: call.createdAt,
          started_at: call.startedAt,
          ended_at: call.endedAt,
        });
      }

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        calls: callHistory,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_count: totalCount,
          limit,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to get call history: ' + error.message,
      );
    }
  }

  /**
   * Mark a call as missed (actionMissedCall)
   */
  async missedCall(callerId: string, dto: MissedCallDto): Promise<any> {
    try {
      const call = await this.voiceCallsRepository.findOne({
        where: { callId: dto.callId },
      });

      if (!call) {
        throw new NotFoundException('Call not found');
      }

      // Only the caller can mark a call as missed
      if (call.callerId !== callerId) {
        throw new UnauthorizedException('Only the caller can mark missed');
      }

      // Only allow when still ringing/not started
      if (!['initiated', 'ringing'].includes(call.status)) {
        return {
          success: false,
          message: 'Call is not in a state that can be marked missed',
          status: call.status,
        };
      }

      // Mark as missed
      call.status = 'missed';
      call.endedAt = new Date();
      await this.voiceCallsRepository.save(call);

      // Send terminal event to receiver to stop ringing
      const receiver = await this.usersRepository.findOne({
        where: { id: call.receiverId },
      });
      const caller = await this.usersRepository.findOne({
        where: { id: call.callerId },
      });

      if (receiver && receiver.fcmToken) {
        const event = {
          event_type: 'missed_call',
          call_id: call.callId,
          call_type: call.type,
          sender_id: callerId,
          receiver_id: receiver.id,
          sender_name: caller
            ? `${caller.firstName || ''} ${caller.lastName || ''}`.trim()
            : '',
          receiver_name: `${receiver.firstName || ''} ${receiver.lastName || ''}`.trim(),
          timestamp: Math.floor(Date.now() / 1000).toString(),
        };
        await NotificationService.SendTerminalEvent(receiver.fcmToken, event);
      }

      // Send missed call notification
      if (receiver && caller) {
        await this.sendMissedCallNotificationInternal(receiver, caller, call);
      }

      return {
        success: true,
        message: 'Call marked as missed',
        call_id: dto.callId,
        type: call.type,
        status: call.status,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to mark call as missed: ' + error.message,
      );
    }
  }

  /**
   * Send missed call notification (internal helper)
   */
  private async sendMissedCallNotificationInternal(
    recipient: UserEntity,
    caller: UserEntity,
    call: VoiceCallEntity,
  ): Promise<void> {
    try {
      if (!recipient.fcmToken) {
        return;
      }

      const callerInfo = await this.getUserInfo(caller);
      const callerName = callerInfo.name || 'Someone';

      const callTypeText = call.type === 'video' ? 'Video' : 'Voice';
      const title = `Missed ${callTypeText} Call`;
      const body = `You missed a ${callTypeText} call from ${callerName}`;

      const additionalData = {
        call_id: call.callId,
        caller_id: call.callerId,
        receiver_id: call.receiverId,
        call_status: 'missed',
        event_type: 'missed_call',
        caller_name: callerName,
        caller_avatar: callerInfo.avatar,
        call_type: call.type,
        timestamp: new Date().toISOString(),
        category: 'missed_call',
        call_back_available: 'true',
      };

      await NotificationService.toOneNotification(
        recipient.fcmToken,
        title,
        body,
        false, // shouldLogout
        false, // by_backend (save to database for missed calls)
        additionalData,
      );
    } catch (error) {
      console.error('Missed call notification error:', error);
    }
  }

  /**
   * Delete a call from history (actionDeleteCall)
   */
  async deleteCall(userId: string, dto: DeleteCallDto): Promise<any> {
    try {
      const call = await this.voiceCallsRepository.findOne({
        where: { callId: dto.callId },
      });

      if (!call) {
        throw new NotFoundException('Call not found');
      }

      // Verify user is part of this call
      if (call.callerId !== userId && call.receiverId !== userId) {
        throw new UnauthorizedException('You are not part of this call');
      }

      await this.voiceCallsRepository.remove(call);

      return {
        success: true,
        message: 'Call deleted from history',
        call_id: dto.callId,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete call: ' + error.message,
      );
    }
  }

  /**
   * Update user's device platform (actionUpdatePlatform)
   */
  async updatePlatform(
    userId: string,
    dto: UpdatePlatformDto,
  ): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.platform = dto.platform;
      await this.usersRepository.save(user);

      return {
        success: true,
        message: 'Platform updated successfully',
        platform: dto.platform,
        user_id: userId,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update platform: ' + error.message,
      );
    }
  }

  /**
   * Update user's VoIP token (actionUpdateVoipToken)
   */
  async updateVoipToken(
    userId: string,
    dto: UpdateVoipTokenDto,
  ): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.voipToken = dto.voipToken;

      // Automatically set platform to ios_voip when VoIP token is provided
      if (!user.platform || user.platform !== 'ios_voip') {
        user.platform = 'ios_voip';
      }

      await this.usersRepository.save(user);

      return {
        success: true,
        message: 'VoIP token updated successfully',
        token_preview: dto.voipToken.substring(0, 20) + '...',
        platform: user.platform,
        user_id: userId,
        note: 'This token will be used for iOS VoIP call notifications via direct APNs',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update VoIP token: ' + error.message,
      );
    }
  }

  /**
   * Test FCM delivery (actionTestFcmDelivery)
   */
  async testFcmDelivery(
    userId: string,
    dto: TestFcmDeliveryDto,
  ): Promise<any> {
    try {
      const receiver = await this.usersRepository.findOne({
        where: { id: dto.receiverId },
      });

      if (!receiver || !receiver.fcmToken) {
        return {
          success: false,
          message: 'Receiver not found or has no FCM token',
        };
      }

      const testData = {
        event_type: 'test_call',
        call_type: 'voice',
        call_id: 'test_' + Date.now(),
        channel_name: 'test_channel',
        token: 'test_token',
        app_id: AgoraService.getAppId(),
        caller_uid: '999999',
        receiver_uid: '888888',
        sender_id: userId,
        receiver_id: dto.receiverId,
        sender_name: 'Test Caller',
        receiver_name: 'Test Receiver',
        sender_avatar: '',
        receiver_avatar: '',
        timestamp: new Date().toISOString(),
      };

      const result = await NotificationService.SendDataOnlyMessage(
        receiver.fcmToken,
        testData,
      );

      return {
        success: true,
        message: 'Test FCM message sent',
        delivery_result: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to test FCM delivery: ' + error.message,
      );
    }
  }

  /**
   * Confirm call delivery (actionConfirmCallDelivery)
   */
  async confirmCallDelivery(
    receiverId: string,
    dto: ConfirmCallDeliveryDto,
  ): Promise<any> {
    try {
      const call = await this.voiceCallsRepository.findOne({
        where: { callId: dto.callId },
      });

      if (!call) {
        throw new NotFoundException('Call not found');
      }

      // Verify the authenticated user is the receiver
      if (call.receiverId !== receiverId) {
        throw new UnauthorizedException(
          'You are not the receiver of this call',
        );
      }

      // Get caller info
      const caller = await this.usersRepository.findOne({
        where: { id: call.callerId },
      });

      if (!caller || !caller.fcmToken) {
        return {
          success: false,
          message:
            'Caller not found or has no FCM token - cannot send confirmation',
        };
      }

      // Get receiver info
      const receiver = await this.usersRepository.findOne({
        where: { id: receiverId },
      });
      const receiverName = receiver
        ? `${receiver.firstName || ''} ${receiver.lastName || ''}`.trim()
        : 'Unknown';

      // Prepare confirmation data
      const confirmationData = {
        call_id: dto.callId,
        receiver_id: receiverId,
        receiver_name: receiverName,
        delivery_status: dto.deliveryStatus || 'received',
        message: this.getDeliveryStatusMessage(
          dto.deliveryStatus || 'received',
          receiverName,
        ),
      };

      // Send confirmation to caller
      const fcmResult = await NotificationService.SendCallDeliveryConfirmation(
        caller.fcmToken,
        confirmationData,
      );

      return {
        success: true,
        message: 'Delivery confirmation sent to caller',
        call_id: dto.callId,
        delivery_status: dto.deliveryStatus || 'received',
        confirmation_sent_to: call.callerId,
        fcm_result: fcmResult,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to confirm call delivery: ' + error.message,
      );
    }
  }

  /**
   * Get user-friendly message for delivery status
   */
  private getDeliveryStatusMessage(
    status: string,
    receiverName: string,
  ): string {
    switch (status) {
      case 'received':
        return `${receiverName}'s device received the call`;
      case 'displayed':
        return `${receiverName}'s phone is showing the incoming call`;
      case 'ringing':
        return `${receiverName}'s phone is ringing`;
      default:
        return `${receiverName} received the call notification`;
    }
  }

  /**
   * Send missed call notification (actionSendMissedCallNotification)
   */
  async sendMissedCallNotification(
    callerId: string,
    dto: SendMissedCallNotificationDto,
  ): Promise<any> {
    try {
      const call = await this.voiceCallsRepository.findOne({
        where: { callId: dto.callId },
      });

      if (!call) {
        throw new NotFoundException('Call not found');
      }

      // Verify user is the caller
      if (call.callerId !== callerId) {
        throw new UnauthorizedException(
          'Only the caller can send missed call notifications',
        );
      }

      // Update call status to missed if still initiated/ringing
      if (['initiated', 'ringing'].includes(call.status)) {
        call.status = 'missed';
        call.endedAt = new Date();
        await this.voiceCallsRepository.save(call);
      }

      // Send missed call notification to receiver
      const receiver = await this.usersRepository.findOne({
        where: { id: call.receiverId },
      });
      const caller = await this.usersRepository.findOne({
        where: { id: call.callerId },
      });

      if (receiver && caller) {
        await this.sendMissedCallNotificationInternal(receiver, caller, call);
      }

      return {
        success: true,
        message: 'Missed call notification sent',
        call_id: dto.callId,
        status: call.status,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to send missed call notification: ' + error.message,
      );
    }
  }

  /**
   * Debug FCM (actionDebugFcm)
   */
  async debugFcm(userId: string, dto: DebugFcmDto): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const testMessage = dto.testMessage || 'FCM Test Message';

      const tokenInfo = {
        has_token: !!user.fcmToken,
        token_length: user.fcmToken ? user.fcmToken.length : 0,
        token_preview: user.fcmToken
          ? user.fcmToken.substring(0, 30) + '...'
          : null,
        platform: user.platform || 'not_set',
        user_id: userId,
      };

      if (!user.fcmToken) {
        return {
          success: false,
          message: 'No FCM token found for user',
          token_info: tokenInfo,
        };
      }

      const testData = {
        call_type: 'voice',
        call_id: 'debug_' + Date.now(),
        channel_name: 'debug_channel',
        token: 'debug_token',
        app_id: 'debug_app',
        caller_uid: '999',
        receiver_uid: '999',
        sender_id: userId,
        receiver_id: userId,
        sender_name: 'Debug Test',
        receiver_name: 'You',
        sender_avatar: '',
        receiver_avatar: '',
      };

      const result = await NotificationService.SendDataOnlyMessage(
        user.fcmToken,
        testData,
        userId,
      );

      return {
        success: true,
        message: 'FCM debug test completed',
        token_info: tokenInfo,
        test_result: result,
        recommendations: this.getFcmRecommendations(tokenInfo, result),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to debug FCM: ' + error.message,
      );
    }
  }

  /**
   * Get FCM troubleshooting recommendations
   */
  private getFcmRecommendations(tokenInfo: any, result: any): string[] {
    const recommendations: string[] = [];

    if (!tokenInfo.has_token) {
      recommendations.push('User needs to register FCM token first');
    } else if (tokenInfo.token_length < 140) {
      recommendations.push('FCM token seems too short - might be invalid');
    }

    if (!tokenInfo.platform || tokenInfo.platform === 'not_set') {
      recommendations.push(
        'User should call update-platform API to set device type',
      );
    }

    if (result?.fcm_accepted === false) {
      recommendations.push(
        'FCM rejected the message - token might be expired or invalid',
      );
      recommendations.push('Ask user to refresh/re-register their FCM token');
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Everything looks good! If calls still not working, check app-side FCM handling',
      );
    }

    return recommendations;
  }

  /**
   * Test VoIP push (actionTestVoipPush)
   */
  async testVoipPush(
    callerId: string,
    dto: TestVoipPushDto,
  ): Promise<any> {
    try {
      const receiverId = dto.receiverId || callerId;

      const receiver = await this.usersRepository.findOne({
        where: { id: receiverId },
      });

      if (!receiver) {
        return {
          success: false,
          message: 'Receiver not found',
          receiver_id: receiverId,
        };
      }

      if (!receiver.fcmToken && !receiver.voipToken) {
        return {
          success: false,
          message: 'Receiver has no FCM token or VoIP token',
          receiver_id: receiverId,
          receiver_platform: receiver.platform || 'not_set',
        };
      }

      const caller = await this.usersRepository.findOne({
        where: { id: callerId },
      });
      const callerInfo = await this.getUserInfo(caller || ({} as UserEntity));
      const callerName = callerInfo.name || 'Test Caller';

      const receiverInfo = await this.getUserInfo(receiver);
      const testCallData = {
        call_type: 'voice',
        call_id: 'test_voip_' + Date.now(),
        channel_name: 'test_channel_' + crypto.randomBytes(8).toString('hex'),
        token: 'test_token',
        app_id: AgoraService.getAppId(),
        caller_uid: 999,
        receiver_uid: 888,
        sender_id: callerId,
        receiver_id: receiverId,
        sender_name: callerName,
        receiver_name: receiverInfo.name || 'Test Receiver',
        sender_avatar: callerInfo.avatar || '',
        receiver_avatar: receiverInfo.avatar || '',
      };

      const result = await NotificationService.SendDataOnlyMessage(
        receiver.fcmToken || receiver.voipToken || '',
        testCallData,
      );

      return {
        success: true,
        message: 'VoIP push test completed',
        test_info: {
          caller_id: callerId,
          receiver_id: receiverId,
          receiver_platform: receiver.platform || 'not_set',
          has_voip_token: !!receiver.voipToken,
          has_fcm_token: !!receiver.fcmToken,
          test_call_id: testCallData.call_id,
        },
        notification_result: result,
        analysis: {
          delivery_time_ms: 0, // TODO: Measure actual time
          total_sent: result?.total_sent || 0,
          successful_deliveries: result?.successful_deliveries || 0,
          failed_deliveries: result?.failed_deliveries || 0,
          fcm_accepted: result?.fcm_accepted || false,
          platform: result?.platform || 'unknown',
          delivery_status: result?.delivery_status || [],
        },
        logs: {
          message: 'Check server logs for detailed output',
          look_for: '🧪 VoIP Push Test',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to test VoIP push: ' + error.message,
      );
    }
  }
}
