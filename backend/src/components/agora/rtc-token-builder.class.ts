import { AccessToken } from './access-token.class';

/**
 * RtcTokenBuilder Class
 * Official Agora RTC Token Builder implementation for TypeScript
 */
export class RtcTokenBuilder {
  static readonly RoleAttendee = 0;
  static readonly RolePublisher = 1;
  static readonly RoleSubscriber = 2;
  static readonly RoleAdmin = 101;

  /**
   * Build token with UID
   * 
   * @param appID The App ID issued by Agora
   * @param appCertificate Certificate of the application
   * @param channelName Unique channel name for the AgoraRTC session
   * @param uid User ID (32-bit unsigned integer, 1 to 2^32-1)
   * @param role Role_Publisher = 1: A broadcaster (host) in a live-broadcast profile.
   *             Role_Subscriber = 2: (Default) An audience in a live-broadcast profile.
   * @param privilegeExpireTs Expiration timestamp (seconds since 1/1/1970)
   * @returns Generated token string
   */
  static buildTokenWithUid(
    appID: string,
    appCertificate: string,
    channelName: string,
    uid: number,
    role: number,
    privilegeExpireTs: number,
  ): string {
    return RtcTokenBuilder.buildTokenWithUserAccount(appID, appCertificate, channelName, uid, role, privilegeExpireTs);
  }

  /**
   * Build token with user account
   * 
   * @param appID The App ID issued by Agora
   * @param appCertificate Certificate of the application
   * @param channelName Unique channel name for the AgoraRTC session
   * @param userAccount The user account (can be string or number)
   * @param role Role_Publisher = 1: A broadcaster (host) in a live-broadcast profile.
   *             Role_Subscriber = 2: (Default) An audience in a live-broadcast profile.
   * @param privilegeExpireTs Expiration timestamp (seconds since 1/1/1970)
   * @returns Generated token string
   */
  static buildTokenWithUserAccount(
    appID: string,
    appCertificate: string,
    channelName: string,
    userAccount: string | number,
    role: number,
    privilegeExpireTs: number,
  ): string {
    const token = AccessToken.init(appID, appCertificate, channelName, userAccount);
    if (!token) {
      throw new Error('Failed to initialize AccessToken');
    }

    const Privileges = AccessToken.Privileges;

    // Add join channel privilege
    token.addPrivilege(Privileges.kJoinChannel, privilegeExpireTs);

    // Add publish privileges for attendees, publishers, and admins
    if (role === RtcTokenBuilder.RoleAttendee || role === RtcTokenBuilder.RolePublisher || role === RtcTokenBuilder.RoleAdmin) {
      token.addPrivilege(Privileges.kPublishVideoStream, privilegeExpireTs);
      token.addPrivilege(Privileges.kPublishAudioStream, privilegeExpireTs);
      token.addPrivilege(Privileges.kPublishDataStream, privilegeExpireTs);
    }

    return token.build();
  }
}
