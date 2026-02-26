import { Injectable } from '@nestjs/common';
import { RtcTokenBuilder } from './agora/rtc-token-builder.class';

/**
 * Agora Token Builder Service
 * Generates RTC tokens for Agora voice/video calls
 * Uses official Agora RtcTokenBuilder implementation
 */
@Injectable()
export class AgoraTokenBuilderService {
  readonly ROLE_PUBLISHER = RtcTokenBuilder.RolePublisher;
  readonly ROLE_SUBSCRIBER = RtcTokenBuilder.RoleSubscriber;
  readonly ROLE_ATTENDEE = RtcTokenBuilder.RoleAttendee;
  readonly ROLE_ADMIN = RtcTokenBuilder.RoleAdmin;

  /**
   * Build RTC token with UID
   * Uses official Agora RtcTokenBuilder
   */
  buildTokenWithUid(
    appId: string,
    appCertificate: string,
    channelName: string,
    uid: number,
    role: number,
    privilegeExpiredTs: number,
  ): string {
    return RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs);
  }

  /**
   * Build RTC token with account (string-based user identifier)
   * Uses official Agora RtcTokenBuilder
   */
  buildTokenWithAccount(
    appId: string,
    appCertificate: string,
    channelName: string,
    account: string | number,
    role: number,
    privilegeExpiredTs: number,
  ): string {
    return RtcTokenBuilder.buildTokenWithUserAccount(appId, appCertificate, channelName, account, role, privilegeExpiredTs);
  }

  /**
   * Validate token format
   */
  isValidToken(token: string): boolean {
    if (!token) {
      return false;
    }

    try {
      // Check if token starts with version "006" and has minimum length
      if (token.length < 35) {
        return false;
      }
      const version = token.substring(0, 3);
      return version === '006';
    } catch {
      return false;
    }
  }
}
