import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserEntity } from '../entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { VerifyResetCodeDto } from '../dto/verify-reset-code.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { SendPhoneVerificationDto, VerifyPhoneCodeDto, RegisterVerifiedDto } from '../dto/phone-verification.dto';
import { SetUserCitiesDto } from '../dto/set-user-cities.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Public/user-facing service — handles all public endpoints matching Yii API
 */
@Injectable()
export class UsersPublicService {
  private readonly baseHost: string;
  private readonly smsApiUrl = 'https://otp-sender-five.vercel.app/api/messages/send-otp';
  private readonly smsApiToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsImlhdCI6MTcyNDMxMTA2M30.DImJ6I86yUDVXCrAOYhkyxJERSgAgO_bPuyH0wnUJ1A';
  private readonly uploadsDir: string;

  // In-memory session store (in production, use Redis or database)
  private sessionStore: Map<string, any> = new Map();

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.baseHost = this.configService.get<string>('BASE_HOST') || 'http://localhost/';
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Generate unique 20-character ID
   */
  private generateUniqueId(): string {
    return crypto.randomBytes(10).toString('hex').substring(0, 20);
  }

  /**
   * Generate 32-character token
   */
  private generateToken(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generate 6-digit verification code
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Normalize phone number (Lebanese format handling)
   */
  private normalizePhone(phone: string, countryCode: string): string {
    const phoneNormalized = phone.replace(/\D+/g, '');
    
    if (countryCode === '+961') {
      // Case 1: 8 digits starting with 0 → remove leading 0 (7 digits)
      if (phoneNormalized.length === 8 && phoneNormalized[0] === '0') {
        return phoneNormalized.substring(1);
      }
      // Case 2: 9 digits starting with 0 → remove leading 0 (8 digits)
      if (phoneNormalized.length === 9 && phoneNormalized[0] === '0') {
        return phoneNormalized.substring(1);
      }
    }
    
    return phoneNormalized;
  }

  /**
   * Send SMS via API
   */
  private async sendSMS(phone: string, message: string): Promise<boolean> {
    try {
      // Extract OTP code from message
      const codeMatch = message.match(/\b\d{6}\b/);
      const otpCode = codeMatch ? codeMatch[0] : '';
      
      if (!otpCode) {
        console.error('No OTP code found in message:', message);
        return false;
      }

      // Remove + from country code
      const phoneCode = phone.replace('+', '');
      
      const payload = JSON.stringify({
        phoneCode: phoneCode.substring(0, 3),
        phoneNumber: phoneCode.substring(3),
        otp: otpCode,
      });

      return new Promise((resolve) => {
        const options = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.smsApiToken}`,
            'Content-Type': 'application/json',
          },
        };

        const req = https.request(this.smsApiUrl, options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            if (res.statusCode === 200) {
              console.log('SMS sent successfully to:', phone);
              resolve(true);
            } else {
              console.error('SMS sending failed - HTTP:', res.statusCode, 'Response:', data);
              resolve(false);
            }
          });
        });

        req.on('error', (error) => {
          console.error('SMS sending error:', error);
          resolve(false);
        });

        req.write(payload);
        req.end();
      });
    } catch (error) {
      console.error('SMS sending exception:', error);
      return false;
    }
  }

  /**
   * Upload file helper
   */
  private async uploadFile(
    file: Express.Multer.File,
    folder: string,
    allowedExtensions: string[],
  ): Promise<string | null> {
    if (!file) {
      return null;
    }

    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException(
        `File extension '${ext}' is not allowed. Allowed: ${allowedExtensions.join(', ')}`,
      );
    }

    // Create upload directory: uploads/{folder}/Y/m/d
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const relDir = path.join(folder, String(year), month, day);
    const absDir = path.join(this.uploadsDir, relDir);

    if (!fs.existsSync(absDir)) {
      fs.mkdirSync(absDir, { recursive: true });
    }

    // Generate unique filename
    const basename = `file_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const savedName = `${basename}.${ext}`;
    const absPath = path.join(absDir, savedName);

    // Save file
    fs.writeFileSync(absPath, file.buffer);

    // Generate public URL
    const relPath = path.join(relDir, savedName).replace(/\\/g, '/');
    const publicUrl = `${this.baseHost}${relPath}`;

    return publicUrl;
  }

  /**
   * Register user (actionRegister)
   */
  async register(dto: RegisterDto, files?: { coverImage?: Express.Multer.File; cv?: Express.Multer.File }): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'countryCode', 'phoneNumber', 'password'];
      const missing = requiredFields.filter((f) => !dto[f]);
      if (missing.length > 0) {
        throw new BadRequestException(`Missing required fields: ${missing.join(', ')}`);
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.email)) {
        throw new BadRequestException('Invalid email format');
      }

      // Validate password
      if (dto.password.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters long');
      }

      // Validate phone
      const country = dto.countryCode.trim();
      const phone = dto.phoneNumber.trim();
      const fullPhone = country + phone;
      if (!/^\+\d{8,15}$/.test(fullPhone)) {
        throw new BadRequestException('Please provide a valid country code and phone number.');
      }

      // Check duplicates
      const existingEmail = await this.usersRepository.findOne({
        where: { email: dto.email.trim() },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }

      const existingPhone = await this.usersRepository.findOne({
        where: { countryCode: country, phoneNumber: phone },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }

      // Create user
      const userId = this.generateUniqueId();
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const token = this.generateToken();

      const user = this.usersRepository.create({
        id: userId,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email.trim(),
        countryCode: country,
        phoneNumber: phone,
        password: hashedPassword,
        token,
        isActivated: 1,
        isGuest: 0,
        centerNum: 10,
        registrationMethod: 'phone_number',
        averageRating: 0.0,
        totalRatings: 0,
        followersCount: 0,
        followingCount: 0,
        isPublicProfile: 1,
        fcmToken: dto.fcmToken || null,
        gender: dto.gender || null,
        birthDate: dto.birthDate || null,
        address: dto.address || null,
        bio: dto.bio ? dto.bio.trim() : null,
        location: dto.location ? dto.location.trim() : null,
        languages: dto.languages
          ? typeof dto.languages === 'string'
            ? dto.languages
            : JSON.stringify(dto.languages)
          : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Partial<UserEntity>);

      // Handle cover image upload
      if (files?.coverImage) {
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
        const coverImageUrl = await this.uploadFile(files.coverImage, 'users/cover_images', allowedExtensions);
        if (coverImageUrl) {
          user.coverImage = coverImageUrl;
        }
      }

      // Handle CV upload
      if (files?.cv) {
        const allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];
        const cvUrl = await this.uploadFile(files.cv, 'users/cv', allowedExtensions);
        if (cvUrl) {
          user.cv = cvUrl;
        }
      }

      await this.usersRepository.save(user);
      await queryRunner.commitTransaction();

      // Prepare response
      const { password, ...userData } = user;

      return {
        succeeded: true,
        data: userData,
        token: user.token,
        message: 'User registered successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Login user (actionLogin)
   */
  async login(dto: LoginDto): Promise<any> {
    try {
      // Find user
      const user = await this.usersRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.countryCode = :countryCode', { countryCode: dto.countryCode })
        .andWhere('user.phoneNumber = :phoneNumber', { phoneNumber: dto.phoneNumber })
        .andWhere('user.isActivated = :isActivated', { isActivated: 1 })
        .getOne();

      if (!user) {
        throw new NotFoundException('User not found or account is inactive');
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Incorrect password');
      }

      // Update token, last_seen, and platform
      user.token = this.generateToken();
      user.lastSeen = new Date();

      if (dto.platform) {
        const platformMap: Record<string, string> = {
          ios: 'ios_voip',
          ios_voip: 'ios_voip',
          android: 'android_fcm',
          android_fcm: 'android_fcm',
        };
        const postedPlatform = dto.platform.toLowerCase().trim();
        if (platformMap[postedPlatform]) {
          user.platform = platformMap[postedPlatform];
        }
      }

      await this.usersRepository.save(user);

      // Prepare user data
      const { password: _, ...userData } = user;
      const userDataWithImages = { ...userData, images: [] as any[] }; // TODO: Implement fetchUserImages

        return {
          succeeded: true,
          message: 'Login successful',
          user: userDataWithImages,
          token: user.token,
        };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Server error occurred');
    }
  }

  /**
   * Find user by token (for authentication)
   */
  async findUserByToken(token: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { token, isActivated: 1 },
    });
  }

  /**
   * Health check (actionHealth)
   */
  async health(): Promise<any> {
    return {
      succeeded: true,
      message: 'Users API is working success',
      timestamp: new Date().toISOString(),
      version: '3.0.0',
    };
  }

  // Additional methods will be implemented following the same pattern...
  // Due to length constraints, I'll create the remaining methods in subsequent files
  // or continue in the next response

  /**
   * Forgot password (actionForgotPassword)
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<any> {
    try {
      const phone = this.normalizePhone(dto.phoneNumber, dto.countryCode);
      const country = dto.countryCode.trim();

    const user = await this.usersRepository.findOne({
        where: { countryCode: country, phoneNumber: phone, isActivated: 1 },
      });

      if (!user) {
        throw new NotFoundException('User not found or inactive');
      }

      // Rate limiting check (simplified - in production use Redis)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Check reset code date for rate limiting
      const RESEND_TIME = 60; // seconds
      const canSend = !user.resetCodeDate || 
        (Date.now() - new Date(user.resetCodeDate).getTime()) / 1000 >= RESEND_TIME;

      if (!canSend) {
        throw new HttpException(
          { succeeded: false, message: 'Rate limit exceeded. Try later.' },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Generate code
      const code = this.generateCode();
      user.resetCode = code;
      user.resetCodeDate = new Date();

      await this.usersRepository.save(user);

      // Send SMS
      const fullPhone = country + phone;
      const message = `Your password reset code is: ${code}. This code expires in 1 hour.`;
      const smsSent = await this.sendSMS(fullPhone, message);

      if (!smsSent) {
        throw new InternalServerErrorException('Failed to send SMS. Please try again.');
      }

      return {
        succeeded: true,
        message: 'Password reset code sent to your phone',
        resetCode: process.env.NODE_ENV === 'development' ? code : null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to send reset code: ' + error.message);
    }
  }

  /**
   * Verify reset code (actionVerifyResetCode)
   */
  async verifyResetCode(dto: VerifyResetCodeDto): Promise<any> {
    try {
      if (!/^\d{6}$/.test(dto.resetCode)) {
        throw new BadRequestException('Reset code must be 6 digits');
      }

      // Find user with active reset code (1 hour validity)
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() - 1);

      let query = this.usersRepository
        .createQueryBuilder('user')
        .where('user.resetCode = :code', { code: dto.resetCode })
        .andWhere('user.isActivated = :isActivated', { isActivated: 1 })
        .andWhere('user.resetCodeDate >= :expiryTime', { expiryTime });

      if (dto.phoneNumber && dto.countryCode) {
        const phone = this.normalizePhone(dto.phoneNumber, dto.countryCode);
        query = query
          .andWhere('user.phoneNumber = :phone', { phone })
          .andWhere('user.countryCode = :country', { country: dto.countryCode });
      }

      const user = await query.getOne();

      if (!user) {
        throw new BadRequestException('Invalid or expired reset code');
      }

      // Store verification in session (simplified)
      const sessionKey = `reset_${user.id}`;
      this.sessionStore.set(sessionKey, { verified: true, userId: user.id });

      return {
        succeeded: true,
        message: 'Reset code verified',
        verified: true,
        phone: user.phoneNumber,
        countryCode: user.countryCode,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Server error occurred');
    }
  }

  /**
   * Reset password (actionResetPassword)
   */
  async resetPassword(dto: ResetPasswordDto): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (dto.newPassword !== dto.confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      if (dto.newPassword.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters long');
      }

      // Find user with active reset code
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() - 1);

      const user = await this.usersRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.isActivated = :isActivated', { isActivated: 1 })
        .andWhere('user.resetCode IS NOT NULL')
        .andWhere('user.resetCodeDate >= :expiryTime', { expiryTime })
        .getOne();

      if (!user) {
        throw new UnauthorizedException(
          'No active reset request found. Please request and verify a reset code first.',
        );
      }

      user.password = await bcrypt.hash(dto.newPassword, 10);
      user.resetCode = null;
      user.resetCodeDate = null;
      user.token = this.generateToken();

      await this.usersRepository.save(user);
      await queryRunner.commitTransaction();

      return {
        succeeded: true,
        message: 'Password reset successfully',
        token: user.token,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Password reset failed');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update profile (actionUpdateProfile)
   * Note: This is a simplified version - full implementation would handle file uploads
   */
  async updateProfile(userId: string, dto: UpdateProfileDto, files?: {
    coverImage?: Express.Multer.File;
    coverVideo?: Express.Multer.File;
    mainImage?: Express.Multer.File;
    image?: Express.Multer.File;
  }): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Handle file uploads
      if (files?.coverImage || files?.coverVideo) {
        const coverFile = files.coverImage || files.coverVideo;
        if (coverFile) {
          const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
          const coverUrl = await this.uploadFile(coverFile, 'users/cover_media', allowedExtensions);
          if (coverUrl) {
            user.coverImage = coverUrl;
          }
        }
      }

      // Handle cover image deletion
      if (dto.coverImage === '' || dto.coverImage?.toLowerCase() === 'delete' || dto.coverImage?.toLowerCase() === 'null') {
        user.coverImage = null;
      }

      if (dto.coverVideo === '' || dto.coverVideo?.toLowerCase() === 'delete' || dto.coverVideo?.toLowerCase() === 'null') {
        user.coverImage = null;
      }

      // Handle profile image upload
      if (files?.mainImage || files?.image) {
        const profileFile = files.mainImage || files.image;
        if (profileFile) {
          const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
          const profileUrl = await this.uploadFile(profileFile, 'users/profile_images', allowedExtensions);
          if (profileUrl) {
            user.mainImage = profileUrl;
          }
        }
      }

      // Handle profile image deletion
      if (dto.mainImage === '' || dto.mainImage?.toLowerCase() === 'delete' || dto.mainImage?.toLowerCase() === 'null') {
        user.mainImage = null;
      }

      if (dto.image === '' || dto.image?.toLowerCase() === 'delete' || dto.image?.toLowerCase() === 'null') {
        user.mainImage = null;
      }

      // Update allowed fields
      if (dto.firstName !== undefined) user.firstName = dto.firstName;
      if (dto.lastName !== undefined) user.lastName = dto.lastName;
      if (dto.email !== undefined) {
        // Check email uniqueness
        const existing = await this.usersRepository.findOne({
          where: { email: dto.email },
        });
        if (existing && existing.id !== userId) {
          throw new ConflictException('Email already exists');
        }
        user.email = dto.email;
      }
      if (dto.phoneNumber !== undefined) {
        // Check phone uniqueness
        const existing = await this.usersRepository.findOne({
          where: { countryCode: dto.countryCode || user.countryCode, phoneNumber: dto.phoneNumber },
        });
        if (existing && existing.id !== userId) {
          throw new ConflictException('Phone number already exists');
        }
        user.phoneNumber = dto.phoneNumber;
      }
      if (dto.countryCode !== undefined) user.countryCode = dto.countryCode;
      if (dto.address !== undefined) user.address = dto.address;
      if (dto.birthDate !== undefined) user.birthDate = dto.birthDate;
      if (dto.cityId !== undefined) user.cityId = dto.cityId;
      if (dto.provinceId !== undefined) user.provinceId = dto.provinceId;
      if (dto.gender !== undefined) user.gender = dto.gender;
      if (dto.userWork !== undefined) user.userWork = dto.userWork;
      if (dto.languages !== undefined) {
        user.languages = typeof dto.languages === 'string' ? dto.languages : JSON.stringify(dto.languages);
      }
      if (dto.latitude !== undefined) user.latitude = dto.latitude;
      if (dto.longitude !== undefined) user.longitude = dto.longitude;
      if (dto.bio !== undefined) user.bio = dto.bio;
      if (dto.website !== undefined) user.website = dto.website;
      if (dto.location !== undefined) user.location = dto.location;
      if (dto.isPublicProfile !== undefined) user.isPublicProfile = dto.isPublicProfile;
      if (dto.fcmToken !== undefined) user.fcmToken = dto.fcmToken;
      if (dto.voipToken !== undefined) user.voipToken = dto.voipToken;
      if (dto.platform !== undefined) {
        const platformMap: Record<string, string> = {
          ios: 'ios_voip',
          ios_voip: 'ios_voip',
          android: 'android_fcm',
          android_fcm: 'android_fcm',
        };
        const postedPlatform = dto.platform.toLowerCase().trim();
        user.platform = platformMap[postedPlatform] || null as string | null;
      }

      user.updatedAt = new Date();
      await this.usersRepository.save(user);
      await queryRunner.commitTransaction();

      const { password: _pwd, resetCode: _rc, ...userData } = user;

      return {
        succeeded: true,
        message: 'Profile updated successfully',
        user: userData,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Profile update failed');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Change password (actionChangePassword)
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.usersRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.id = :id', { id: userId })
        .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

      const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      if (dto.newPassword.length < 6) {
        throw new BadRequestException('New password must be at least 6 characters long');
      }

      user.password = await bcrypt.hash(dto.newPassword, 10);
      user.token = this.generateToken();
      await this.usersRepository.save(user);
      await queryRunner.commitTransaction();

      return {
        succeeded: true,
        message: 'Password changed successfully',
        token: user.token,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Password change failed');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Send phone verification (actionSendPhoneVerification)
   */
  async sendPhoneVerification(dto: SendPhoneVerificationDto): Promise<any> {
    try {
      const phoneNormalized = this.normalizePhone(dto.phoneNumber, dto.countryCode);
      const country = dto.countryCode.trim();

      // Validate country code
      if (!/^\+\d{1,3}$/.test(country)) {
        throw new BadRequestException('Invalid country code format. Expected format: +XXX');
      }

      // Validate phone
      if (phoneNormalized.length < 6 || phoneNormalized.length > 15) {
        throw new BadRequestException(
          `Invalid phone number format. Expected 6-15 digits, received ${phoneNormalized.length} digits.`,
        );
      }

      // Check if phone already registered
      const existingUser = await this.usersRepository.findOne({
        where: { countryCode: country, phoneNumber: phoneNormalized, isActivated: 1 },
      });

      if (existingUser) {
        throw new ConflictException('Phone number already registered. Please login.');
      }

      // Rate limiting (simplified - use session)
      const sessionKey = `phone_verification_${crypto.createHash('md5').update(country + phoneNormalized).digest('hex')}`;
      const existingVerificationData = this.sessionStore.get(sessionKey);

      if (existingVerificationData && existingVerificationData.lastSent) {
        const timeSinceLast = (Date.now() - existingVerificationData.lastSent) / 1000;
        if (timeSinceLast < 60) {
          throw new HttpException(
            {
              succeeded: false,
              message: `Please wait ${Math.ceil(60 - timeSinceLast)} seconds before requesting a new code`,
              retryAfter: Math.ceil(60 - timeSinceLast),
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
      }

      // Generate code
      const code = this.generateCode();
      const newVerificationData = {
        phone: phoneNormalized,
        country,
        code,
        expires: Date.now() + 600000, // 10 minutes
        attempts: 0,
        lastSent: Date.now(),
        createdAt: Date.now(),
      };

      this.sessionStore.set(sessionKey, newVerificationData);

      // Send SMS
      const fullPhone = country + phoneNormalized;
      const message = `Your verification code is: ${code}`;
      const smsSent = await this.sendSMS(fullPhone, message);

      if (!smsSent) {
        return {
          succeeded: false,
          message: 'Failed to send SMS. Please try again later.',
          codeStored: true,
          verificationCode: process.env.NODE_ENV === 'development' ? code : null,
        };
      }

      return {
        succeeded: true,
        message: 'Verification code sent successfully',
        phone: phoneNormalized,
        countryCode: country,
        expiresIn: 600,
        verificationCode: process.env.NODE_ENV === 'development' ? code : null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to send verification code');
    }
  }

  /**
   * Verify phone code (actionVerifyPhoneCode)
   */
  async verifyPhoneCode(dto: VerifyPhoneCodeDto): Promise<any> {
    try {
      if (!/^\d{6}$/.test(dto.verificationCode)) {
        throw new BadRequestException('Verification code must be 6 digits');
      }

      const phoneNormalized = this.normalizePhone(dto.phoneNumber, dto.countryCode);
      const country = dto.countryCode.trim();

      // Try multiple session keys (for Lebanese number variations)
      const sessionKeysToTry: string[] = [];
      const primaryKey = `phone_verification_${crypto.createHash('md5').update(country + phoneNormalized).digest('hex')}`;
      sessionKeysToTry.push(primaryKey);

      // For Lebanon, try alternative formats
      if (country === '+961') {
        if (phoneNormalized.length === 7) {
          const withLeadingZero = '0' + phoneNormalized;
          sessionKeysToTry.push(`phone_verification_${crypto.createHash('md5').update(country + withLeadingZero).digest('hex')}`);
        } else if (phoneNormalized.length === 8) {
          const withoutFirstDigit = phoneNormalized.substring(1);
          sessionKeysToTry.push(`phone_verification_${crypto.createHash('md5').update(country + withoutFirstDigit).digest('hex')}`);
        }
      }

      // Find verification data
      let verificationData: any = null;
      let foundKey: string | null = null;
      for (const key of sessionKeysToTry) {
        const data = this.sessionStore.get(key);
        if (data) {
          verificationData = data;
          foundKey = key;
          break;
        }
      }

      if (!verificationData || !foundKey) {
        throw new BadRequestException('No verification request found. Please request a new code.');
      }

      // Check expiration
      if (Date.now() > verificationData.expires) {
        this.sessionStore.delete(foundKey);
        throw new BadRequestException('Verification code expired. Please request a new one.');
      }

      // Check attempts
      if (verificationData.attempts >= 5) {
        this.sessionStore.delete(foundKey);
        throw new BadRequestException('Too many attempts. Please request a new code.');
      }

      // Increment attempts
      verificationData.attempts++;
      this.sessionStore.set(foundKey, verificationData);

      // Verify code
      if (verificationData.code !== dto.verificationCode) {
        const attemptsLeft = 5 - verificationData.attempts;
        throw new BadRequestException(
          `Invalid verification code.${attemptsLeft > 0 ? ` Attempts left: ${attemptsLeft}` : ''}`,
        );
      }

      // Verification successful
      const verificationToken = this.generateToken();
      verificationData.verified = true;
      verificationData.verificationToken = verificationToken;
      verificationData.verifiedAt = Date.now();
      verificationData.verifiedPhone = phoneNormalized;
      verificationData.verifiedCountry = country;
      verificationData.expires = Date.now() + 1800000; // 30 minutes

      this.sessionStore.set(foundKey, verificationData);

      return {
        succeeded: true,
        message: 'Phone number verified successfully',
        verified: true,
        phone: phoneNormalized,
        countryCode: country,
        verificationToken,
        expiresIn: 1800,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Server error occurred during verification');
    }
  }

  /**
   * Register verified (actionRegisterVerified)
   * Similar to register but requires verification token
   */
  async registerVerified(dto: RegisterVerifiedDto, files?: {
    coverImage?: Express.Multer.File;
    cv?: Express.Multer.File;
  }): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify the verification token
      const phoneNormalized = this.normalizePhone(dto.phoneNumber, dto.countryCode);
      const country = dto.countryCode.trim();

      // Try multiple session keys
      const sessionKeysToTry: string[] = [];
      const primaryKey = `phone_verification_${crypto.createHash('md5').update(country + phoneNormalized).digest('hex')}`;
      sessionKeysToTry.push(primaryKey);

      if (country === '+961') {
        if (phoneNormalized.length === 7) {
          const withLeadingZero = '0' + phoneNormalized;
          sessionKeysToTry.push(`phone_verification_${crypto.createHash('md5').update(country + withLeadingZero).digest('hex')}`);
        } else if (phoneNormalized.length === 8) {
          const withoutFirstDigit = phoneNormalized.substring(1);
          sessionKeysToTry.push(`phone_verification_${crypto.createHash('md5').update(country + withoutFirstDigit).digest('hex')}`);
        }
      }

      let registerVerificationData: any = null;
      let registerFoundKey: string | null = null;
      for (const key of sessionKeysToTry) {
        const data = this.sessionStore.get(key);
        if (data) {
          registerVerificationData = data;
          registerFoundKey = key;
          break;
        }
      }

      if (!registerVerificationData || !registerVerificationData.verified || registerVerificationData.verificationToken !== dto.verificationToken) {
        throw new UnauthorizedException('Phone verification required or verification expired. Please verify your phone first.');
      }

      if (Date.now() > registerVerificationData.expires) {
        throw new UnauthorizedException('Verification expired. Please verify your phone again.');
      }

      // Proceed with registration (similar to register method)
      const existingEmail = await this.usersRepository.findOne({
        where: { email: dto.email.trim() },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }

      const existingPhone = await this.usersRepository.findOne({
        where: { countryCode: country, phoneNumber: phoneNormalized },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }

      const userId = this.generateUniqueId();
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const token = this.generateToken();

      const user = this.usersRepository.create({
        id: userId,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email.trim(),
        countryCode: country,
        phoneNumber: phoneNormalized,
        password: hashedPassword,
        token,
        isActivated: 1,
        isGuest: 0,
        centerNum: 10,
        registrationMethod: 'phone_number',
        averageRating: 0.0,
        totalRatings: 0,
        followersCount: 0,
        followingCount: 0,
        isPublicProfile: dto.isPublicProfile ?? 1,
        fcmToken: dto.fcmToken || null,
        gender: dto.gender || null,
        birthDate: dto.birthDate || null,
        address: dto.address || null,
        bio: dto.bio ? dto.bio.trim() : null,
        location: dto.location ? dto.location.trim() : null,
        userWork: dto.userWork ? dto.userWork.trim() : null,
        website: dto.website ? dto.website.trim() : null,
        languages: dto.languages
          ? typeof dto.languages === 'string'
            ? dto.languages
            : JSON.stringify(dto.languages)
          : null,
        platform: dto.platform
          ? (dto.platform === 'ios' || dto.platform === 'ios_voip'
              ? 'ios_voip'
              : 'android_fcm')
          : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Partial<UserEntity>);

      // Handle file uploads
      if (files?.coverImage) {
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
        const coverUrl = await this.uploadFile(files.coverImage, 'users/cover_images', allowedExtensions);
        if (coverUrl) {
          user.coverImage = coverUrl;
        }
      }

      if (files?.cv) {
        const allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];
        const cvUrl = await this.uploadFile(files.cv, 'users/cv', allowedExtensions);
        if (cvUrl) {
          user.cv = cvUrl;
        }
      }

      await this.usersRepository.save(user);
      await queryRunner.commitTransaction();

      // Clear verification session
      if (registerFoundKey) {
        this.sessionStore.delete(registerFoundKey);
      }

      const { password: _pwd3, ...userData } = user;

      return {
        succeeded: true,
        data: userData,
        token: user.token,
        message: 'User registered successfully with phone verification',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Set user cities (actionSetUserCities)
   * Matches Yii implementation exactly
   */
  async setUserCities(userId: string, dto: SetUserCitiesDto): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete existing cities
      await queryRunner.manager.delete('user_cities', { user_id: userId });

      // Insert new cities
      let isFirst = true;
      for (const cityId of dto.cities) {
        await queryRunner.manager.insert('user_cities', {
          id: this.generateUniqueId(),
          user_id: userId,
          city_id: cityId,
          main_city: isFirst ? 1 : 0,
        });

        // Set first selected city as user's main city
        if (isFirst) {
          const user = await this.usersRepository.findOne({ where: { id: userId } });
          if (user) {
            user.cityId = cityId;
            await this.usersRepository.save(user);
          }
          isFirst = false;
        }
      }

      await queryRunner.commitTransaction();

      // Fetch cities with joins (same query as getUserCities)
      const cities = await this.dataSource
        .createQueryBuilder()
        .select([
          't1.city_id AS city_id',
          't2.city_name AS city_name',
          't2.city_name_ar AS city_name_ar',
          't3.province AS province',
          't3.province_ar AS province_ar',
          't1.main_city AS main_city',
        ])
        .from('user_cities', 't1')
        .leftJoin('cities', 't2', 't2.id = t1.city_id')
        .leftJoin('province', 't3', 't2.province = t3.id')
        .where('t1.user_id = :userId', { userId })
        .getRawMany();

      // Transform to match Yii response format
      const formattedCities = cities.map((row) => ({
        city_id: row.city_id,
        city_name: row.city_name,
        city_name_ar: row.city_name_ar,
        province: row.province,
        province_ar: row.province_ar,
        main_city: row.main_city ? Boolean(row.main_city) : false,
      }));

      return {
        succeeded: true,
        message: 'User Cities Created Successfully',
        cities: formattedCities,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to set user cities');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get user cities (actionGetUserCities)
   * Matches Yii implementation exactly
   */
  async getUserCities(userId: string): Promise<any> {
    try {
      // Query matches Yii: UserCities::find()->alias('t1')...
      const cities = await this.dataSource
        .createQueryBuilder()
        .select([
          't1.city_id AS city_id',
          't2.city_name AS city_name',
          't2.city_name_ar AS city_name_ar',
          't3.province AS province',
          't3.province_ar AS province_ar',
          't1.main_city AS main_city',
        ])
        .from('user_cities', 't1')
        .leftJoin('cities', 't2', 't2.id = t1.city_id')
        .leftJoin('province', 't3', 't2.province = t3.id')
        .where('t1.user_id = :userId', { userId })
        .getRawMany();

      // Transform to match Yii response format (main_city as boolean)
      const formattedCities = cities.map((row) => ({
        city_id: row.city_id,
        city_name: row.city_name,
        city_name_ar: row.city_name_ar,
        province: row.province,
        province_ar: row.province_ar,
        main_city: row.main_city ? Boolean(row.main_city) : false,
      }));

      return {
        succeeded: true,
        cities: formattedCities,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get user cities');
    }
  }

  /**
   * Update location (actionUpdateLocation)
   * Matches Yii implementation exactly
   */
  async updateLocation(userId: string, dto: UpdateLocationDto): Promise<any> {
    try {
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user is a guest (matches Yii implementation)
      if (user.isGuest === 1) {
        throw new UnauthorizedException('guest_user_restricted');
      }

      // Validate coordinates
      if (dto.latitude === null || dto.latitude === undefined) {
        throw new BadRequestException('Latitude and longitude are required');
      }

      if (dto.longitude === null || dto.longitude === undefined) {
        throw new BadRequestException('Latitude and longitude are required');
      }

      if (typeof dto.latitude !== 'number' || dto.latitude < -90 || dto.latitude > 90) {
        throw new BadRequestException('Invalid latitude. Must be between -90 and 90');
      }

      if (typeof dto.longitude !== 'number' || dto.longitude < -180 || dto.longitude > 180) {
        throw new BadRequestException('Invalid longitude. Must be between -180 and 180');
      }

      // Update coordinates
      user.latitude = dto.latitude as number;
      user.longitude = dto.longitude as number;
      user.updatedAt = new Date();

      await this.usersRepository.save(user);

      // Return response matching Yii format
      return {
        succeeded: true,
        message: 'Location updated successfully',
        user: {
          id: user.id,
          latitude: user.latitude,
          longitude: user.longitude,
        },
        coordinates: {
          latitude: user.latitude ? parseFloat(user.latitude.toString()) : null,
          longitude: user.longitude ? parseFloat(user.longitude.toString()) : null,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update location');
    }
  }
}
