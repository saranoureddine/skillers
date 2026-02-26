import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AgoraTokenBuilderService } from './agora-token-builder.service';

/**
 * Agora Service
 * Manages Agora operations and configuration for voice/video calls
 */
@Injectable()
export class AgoraService {
  readonly ROLE_PUBLISHER = 1;
  readonly ROLE_SUBSCRIBER = 2;
  readonly ROLE_ATTENDEE = 0;
  readonly ROLE_ADMIN = 101;

  private appId: string;
  private appCertificate: string;
  private tokenExpiry: number;
  private initialized = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenBuilder: AgoraTokenBuilderService,
  ) {}

  /**
   * Initialize Agora configuration
   */
  private init(): void {
    if (this.initialized) {
      return;
    }

    this.appId = this.configService.get<string>('AGORA_APP_ID') || '';
    this.appCertificate = this.configService.get<string>('AGORA_APP_CERTIFICATE') || '';
    this.tokenExpiry = this.configService.get<number>('AGORA_TOKEN_EXPIRY') || 3600; // Default: 1 hour

    this.initialized = true;
  }

  /**
   * Generate RTC token for voice call
   */
  generateToken(channelName: string, uid: number, role: number = this.ROLE_PUBLISHER): string {
    this.init();

    if (!this.appId || !this.appCertificate) {
      throw new BadRequestException(
        'Agora credentials not configured. Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE in environment variables.',
      );
    }

    if (!channelName) {
      throw new BadRequestException('Channel name is required');
    }

    if (!uid || !Number.isInteger(uid)) {
      throw new BadRequestException('Valid numeric UID is required');
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + this.tokenExpiry;

    return this.tokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs,
    );
  }

  /**
   * Generate unique channel name for a call between two users
   */
  generateChannelName(callerId: string, receiverId: string): string {
    // Sort IDs to ensure consistent channel name
    const ids = [callerId, receiverId].sort();

    // Create unique channel name with timestamp
    return `voice_${ids.join('_')}_${Date.now()}`;
  }

  /**
   * Generate call credentials for both users
   */
  generateCallCredentials(
    callerId: string,
    receiverId: string,
    callerUid: number,
    receiverUid: number,
    channelName?: string,
  ): {
    channel_name: string;
    caller_token: string;
    receiver_token: string;
    caller_uid: number;
    receiver_uid: number;
    app_id: string;
    expires_at: number;
    expires_in: number;
  } {
    this.init();

    if (!callerId || !receiverId) {
      throw new BadRequestException('Both caller ID and receiver ID are required');
    }

    if (!callerUid || !receiverUid || !Number.isInteger(callerUid) || !Number.isInteger(receiverUid)) {
      throw new BadRequestException('Valid numeric UIDs are required for both caller and receiver');
    }

    // Generate channel name if not provided
    if (!channelName) {
      channelName = this.generateChannelName(callerId, receiverId);
    }

    // Validate channel name
    if (!this.isValidChannelName(channelName)) {
      throw new BadRequestException('Invalid channel name format');
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + this.tokenExpiry;

    // Generate tokens for both users
    const callerToken = this.generateToken(channelName, callerUid, this.ROLE_PUBLISHER);
    const receiverToken = this.generateToken(channelName, receiverUid, this.ROLE_PUBLISHER);

    return {
      channel_name: channelName,
      caller_token: callerToken,
      receiver_token: receiverToken,
      caller_uid: callerUid,
      receiver_uid: receiverUid,
      app_id: this.appId,
      expires_at: privilegeExpiredTs,
      expires_in: this.tokenExpiry,
    };
  }

  /**
   * Get Agora App ID for frontend
   */
  getAppId(): string {
    this.init();

    if (!this.appId) {
      throw new BadRequestException('Agora App ID not configured');
    }

    return this.appId;
  }

  /**
   * Validate channel name format
   */
  isValidChannelName(channelName: string): boolean {
    // Agora channel name requirements:
    // - ASCII characters only
    // - No spaces
    // - 1-64 characters
    // - Can contain: a-z, A-Z, 0-9, !, #, $, %, &, (, ), +, -, :, ;, <, =, ., >, ?, @, [, ], ^, _, {, }, |, ~, comma
    const pattern = /^[a-zA-Z0-9!#$%&()+\-:;<=.>?@[\]^_{}|~,]+$/;
    return !!(channelName && channelName.length > 0 && channelName.length <= 64 && pattern.test(channelName));
  }

  /**
   * Generate token for existing channel (for rejoining calls)
   */
  generateTokenForChannel(channelName: string, uid: number, role: number = this.ROLE_PUBLISHER): string {
    if (!this.isValidChannelName(channelName)) {
      throw new BadRequestException('Invalid channel name format');
    }

    return this.generateToken(channelName, uid, role);
  }

  /**
   * Get token expiry duration in seconds
   */
  getTokenExpiry(): number {
    this.init();
    return this.tokenExpiry;
  }

  /**
   * Check if Agora service is properly configured
   */
  isConfigured(): boolean {
    this.init();
    return !!this.appId && !!this.appCertificate;
  }

  /**
   * Get configuration status
   */
  getConfigStatus(): {
    configured: boolean;
    has_app_id: boolean;
    has_certificate: boolean;
    token_expiry: number;
  } {
    this.init();

    return {
      configured: this.isConfigured(),
      has_app_id: !!this.appId,
      has_certificate: !!this.appCertificate,
      token_expiry: this.tokenExpiry,
    };
  }
}
