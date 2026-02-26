import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * JWT Helper Service
 * Simple JWT implementation for Centrifugo tokens
 * Note: For production, consider using jsonwebtoken package
 */
@Injectable()
export class JwtHelperService {
  /**
   * Sign JWT token
   */
  sign(payload: any, secret: string, options: { algorithm?: string } = {}): string {
    const algorithm = options.algorithm || 'HS256';

    if (algorithm !== 'HS256') {
      throw new Error('Only HS256 algorithm is supported');
    }

    // Create header
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    // Encode header and payload
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));

    // Create signature
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto.createHmac('sha256', secret).update(signatureInput).digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Base64 URL encode
   */
  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}
