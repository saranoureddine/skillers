/**
 * Message Class
 * Internal class for Agora token building
 */
export class Message {
  salt: number;
  ts: number;
  privileges: Map<number, number>;

  constructor() {
    this.salt = Math.floor(Math.random() * 100001);
    this.ts = Math.floor(Date.now() / 1000) + 24 * 3600; // Current timestamp + 24 hours
    this.privileges = new Map<number, number>();
  }

  /**
   * Pack message content into binary buffer
   */
  packContent(): number[] {
    const buffer: number[] = [];

    // Pack salt (32-bit unsigned integer, little-endian)
    const saltBytes = this.packUint32LE(this.salt);
    buffer.push(...saltBytes);

    // Pack timestamp (32-bit unsigned integer, little-endian)
    const tsBytes = this.packUint32LE(this.ts);
    buffer.push(...tsBytes);

    // Pack privileges count (16-bit unsigned integer, little-endian)
    const privilegesCount = this.privileges.size;
    const countBytes = this.packUint16LE(privilegesCount);
    buffer.push(...countBytes);

    // Pack each privilege (key: 16-bit, value: 32-bit)
    for (const [key, value] of this.privileges.entries()) {
      const keyBytes = this.packUint16LE(key);
      buffer.push(...keyBytes);
      const valueBytes = this.packUint32LE(value);
      buffer.push(...valueBytes);
    }

    return buffer;
  }

  /**
   * Unpack message content from binary buffer
   */
  unpackContent(msg: Buffer): void {
    let pos = 0;

    // Unpack salt (32-bit unsigned integer, little-endian)
    this.salt = this.unpackUint32LE(msg, pos);
    pos += 4;

    // Unpack timestamp (32-bit unsigned integer, little-endian)
    this.ts = this.unpackUint32LE(msg, pos);
    pos += 4;

    // Unpack privileges count (16-bit unsigned integer, little-endian)
    const size = this.unpackUint16LE(msg, pos);
    pos += 2;

    // Unpack privileges
    this.privileges = new Map<number, number>();
    for (let i = 0; i < size; i++) {
      const key = this.unpackUint16LE(msg, pos);
      pos += 2;
      const value = this.unpackUint32LE(msg, pos);
      pos += 4;
      this.privileges.set(key, value);
    }
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
}
