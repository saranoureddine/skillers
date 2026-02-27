import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgUserEntity } from '../../modules/ag-users/entities/ag-user.entity';

/**
 * Token Strategy for Passport
 * 
 * This strategy validates database-stored tokens from the Authorization header.
 * Since the system uses database tokens (not JWT), we extract the token
 * from the header and validate it against the database.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    @InjectRepository(AgUserEntity)
    private readonly agUsersRepository: Repository<AgUserEntity>,
  ) {
    super();
    this.logger.log('JwtStrategy (Token Strategy) initialized - using database tokens');
    this.logger.log('Strategy registered with name: jwt');
  }

  /**
   * Authenticate method - required by Passport Strategy
   * This is called by Passport when the guard activates
   */
  authenticate(req: any, options?: any): void {
    this.logger.debug('JwtStrategy.authenticate called');
    this.validate(req)
      .then((user) => {
        this.logger.debug(`Authentication successful for user: ${user?.userId}`);
        this.success(user);
      })
      .catch((err) => {
        this.logger.error(`Authentication failed: ${err?.message}`);
        this.fail(err, 401);
      });
  }

  /**
   * Validate token from request
   * Since we're using database tokens, we extract the token from the header
   * and validate it against the database
   */
  async validate(req: any): Promise<any> {
    const authHeader = req.headers?.authorization;
    this.logger.debug('JwtStrategy.validate called');
    this.logger.debug(`Authorization header: ${authHeader ? authHeader.substring(0, 20) + '...' : 'null'}`);

    if (!authHeader) {
      this.logger.warn('No authorization header found');
      throw new UnauthorizedException('No authorization token provided');
    }

    // Extract token from header (supports both "Bearer" and "Token" prefixes)
    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    
    if (!token) {
      this.logger.warn('Token is empty after extraction');
      throw new UnauthorizedException('Invalid authorization token format');
    }

    this.logger.debug(`Validating token: ${token.substring(0, 20)}...`);

    try {
      // Validate token against database
      const user = await this.agUsersRepository.findOne({
        where: { token },
        select: ['userId', 'userName', 'userRole', 'active', 'emailAddress'],
      });

      if (!user) {
        this.logger.warn(`Token not found in database: ${token.substring(0, 20)}...`);
        throw new UnauthorizedException('Invalid token');
      }

      if (user.active !== '1') {
        this.logger.warn(`User ${user.userId} is not active`);
        throw new UnauthorizedException('User account is not active');
      }

      this.logger.debug(`Token validated successfully for user: ${user.userId}`);
      
      // Return user data that will be attached to request.user
      return {
        userId: user.userId,
        userName: user.userName,
        userRole: user.userRole,
        emailAddress: user.emailAddress,
      };
    } catch (error) {
      this.logger.error(`Token validation error: ${error?.message}`);
      this.logger.error(`Error stack: ${error?.stack}`);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
