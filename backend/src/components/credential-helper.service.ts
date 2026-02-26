import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Credential Helper Service
 * Encrypts and decrypts credentials using application key
 */
@Injectable()
export class CredentialHelperService {
  private readonly encryptionKey: string;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('MAIL_ENCRYPTION_KEY');
    if (!key) {
      throw new InternalServerErrorException(
        'Mail account encryption key is not configured (MAIL_ENCRYPTION_KEY env missing).',
      );
    }
    this.encryptionKey = key;
  }

  /**
   * Encrypt a plain text credential string
   */
  encrypt(plain: string | null): string | null {
    if (plain === null || plain === '') {
      return plain;
    }

    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(plain, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Prepend IV to encrypted data
      const result = iv.toString('hex') + ':' + encrypted;
      return Buffer.from(result).toString('base64');
    } catch (error) {
      throw new InternalServerErrorException('Failed to encrypt credential: ' + error.message);
    }
  }

  /**
   * Decrypt an encrypted credential string
   * Falls back to the original value if decryption fails (legacy plain-text support)
   */
  decrypt(encryptedValue: string | null): string | null {
    if (encryptedValue === null || encryptedValue === '') {
      return encryptedValue;
    }

    try {
      // Try to decode base64
      const decoded = Buffer.from(encryptedValue, 'base64').toString('utf8');
      
      // Check if it contains IV separator (new format)
      if (!decoded.includes(':')) {
        // Legacy plain-text storage
        return encryptedValue;
      }

      const [ivHex, encrypted] = decoded.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);

      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      // Legacy plain-text support - return original value
      return encryptedValue;
    }
  }
}
