import * as crypto from 'crypto';
import { Message } from './message.class';

/**
 * AccessToken Class
 * Official Agora AccessToken implementation for TypeScript
 */
export class AccessToken {
  static readonly Privileges = {
    kJoinChannel: 1,
    kPublishAudioStream: 2,
    kPublishVideoStream: 3,
    kPublishDataStream: 4,
    kRtmLogin: 1000,
  };

  appID: string;
  appCertificate: string;
  channelName: string;
  uid: string;
  message: Message;

  constructor() {
    this.message = new Message();
  }

  /**
   * Set UID
   */
  setUid(uid: string | number): void {
    if (uid === 0 || uid === '0') {
      this.uid = '';
    } else {
      this.uid = String(uid);
    }
  }

  /**
   * Check if string is non-empty
   */
  private isNonEmptyString(name: string, str: string): boolean {
    if (typeof str === 'string' && str !== '') {
      return true;
    }
    console.error(`${name} check failed, should be a non-empty string`);
    return false;
  }

  /**
   * Initialize AccessToken
   */
  static init(appID: string, appCertificate: string, channelName: string, uid: string | number): AccessToken | null {
    const accessToken = new AccessToken();

    if (
      !accessToken.isNonEmptyString('appID', appID) ||
      !accessToken.isNonEmptyString('appCertificate', appCertificate) ||
      !accessToken.isNonEmptyString('channelName', channelName)
    ) {
      return null;
    }

    accessToken.appID = appID;
    accessToken.appCertificate = appCertificate;
    accessToken.channelName = channelName;
    accessToken.setUid(uid);
    accessToken.message = new Message();

    return accessToken;
  }

  /**
   * Initialize AccessToken from existing token
   */
  static initWithToken(token: string, appCertificate: string, channel: string, uid: string | number): AccessToken | null {
    const accessToken = new AccessToken();
    if (!accessToken.extract(token, appCertificate, channel, uid)) {
      return null;
    }
    return accessToken;
  }

  /**
   * Add privilege
   */
  addPrivilege(key: number, expireTimestamp: number): this {
    this.message.privileges.set(key, expireTimestamp);
    return this;
  }

  /**
   * Extract token information
   */
  extract(token: string, appCertificate: string, channelName: string, uid: string | number): boolean {
    const verLen = 3;
    const appidLen = 32;

    const version = token.substring(0, verLen);
    if (version !== '006') {
      console.error(`invalid version ${version}`);
      return false;
    }

    if (
      !this.isNonEmptyString('token', token) ||
      !this.isNonEmptyString('appCertificate', appCertificate) ||
      !this.isNonEmptyString('channelName', channelName)
    ) {
      return false;
    }

    const appid = token.substring(verLen, verLen + appidLen);
    const contentBase64 = token.substring(verLen + appidLen);
    const content = Buffer.from(contentBase64, 'base64');

    let pos = 0;

    // Unpack signature length and signature
    const sigLen = this.unpackUint16LE(content, pos);
    pos += 2;
    const sig = content.subarray(pos, pos + sigLen);
    pos += sigLen;

    // Unpack CRC channel
    const crcChannel = this.unpackUint32LE(content, pos);
    pos += 4;

    // Unpack CRC UID
    const crcUid = this.unpackUint32LE(content, pos);
    pos += 4;

    // Unpack message length and message
    const msgLen = this.unpackUint16LE(content, pos);
    pos += 2;
    const msg = content.subarray(pos, pos + msgLen);

    this.appID = appid;
    const message = new Message();
    message.unpackContent(msg);
    this.message = message;

    // Non-reversible values
    this.appCertificate = appCertificate;
    this.channelName = channelName;
    this.setUid(uid);

    return true;
  }

  /**
   * Build token
   */
  build(): string {
    const msg = this.message.packContent();

    // Combine appID, channelName, uid, and message
    const appIDBytes = Array.from(Buffer.from(this.appID, 'utf8'));
    const channelNameBytes = Array.from(Buffer.from(this.channelName, 'utf8'));
    const uidBytes = Array.from(Buffer.from(this.uid, 'utf8'));
    const val = [...appIDBytes, ...channelNameBytes, ...uidBytes, ...msg];

    // Create HMAC signature
    const sig = crypto.createHmac('sha256', this.appCertificate).update(Buffer.from(val)).digest();

    // Calculate CRC32 for channel name and UID
    const crcChannelName = this.crc32(this.channelName) & 0xffffffff;
    const crcUid = this.crc32(this.uid) & 0xffffffff;

    // Pack signature with length prefix
    const sigWithLen = this.packString(sig);

    // Pack content: signature, CRC channel, CRC UID, message length, message
    const content = [
      ...sigWithLen,
      ...this.packUint32LE(crcChannelName),
      ...this.packUint32LE(crcUid),
      ...this.packUint16LE(msg.length),
      ...msg,
    ];

    const version = '006';
    const ret = version + this.appID + Buffer.from(content).toString('base64');

    return ret;
  }

  /**
   * Pack string with length prefix
   */
  private packString(value: Buffer): number[] {
    const lenBytes = this.packUint16LE(value.length);
    const valueBytes = Array.from(value);
    return [...lenBytes, ...valueBytes];
  }

  /**
   * Pack 32-bit unsigned integer (little-endian)
   */
  private packUint32LE(value: number): number[] {
    const buffer = Buffer.allocUnsafe(4);
    buffer.writeUInt32LE(value, 0);
    return Array.from(buffer);
  }

  /**
   * Unpack 32-bit unsigned integer (little-endian)
   */
  private unpackUint32LE(buffer: Buffer, offset: number): number {
    return buffer.readUInt32LE(offset);
  }

  /**
   * Pack 16-bit unsigned integer (little-endian)
   */
  private packUint16LE(value: number): number[] {
    const buffer = Buffer.allocUnsafe(2);
    buffer.writeUInt16LE(value, 0);
    return Array.from(buffer);
  }

  /**
   * Unpack 16-bit unsigned integer (little-endian)
   */
  private unpackUint16LE(buffer: Buffer, offset: number): number {
    return buffer.readUInt16LE(offset);
  }

  /**
   * CRC32 implementation
   */
  private crc32(str: string): number {
    const table: number[] = [];
    for (let i = 0; i < 256; i++) {
      let crc = i;
      for (let j = 0; j < 8; j++) {
        crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
      }
      table[i] = crc;
    }

    let crc = 0xffffffff;
    for (let i = 0; i < str.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
}
