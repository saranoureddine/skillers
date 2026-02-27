import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Req,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { AgUsersAdminService } from '../services/ag-users.admin.service';
import { CreateAgUserDto } from '../dto/create-ag-user.dto';
import { UpdateAgUserDto } from '../dto/update-ag-user.dto';
import { DeleteAgUserDto } from '../dto/delete-ag-user.dto';
import { LoginAgUserDto } from '../dto/login-ag-user.dto';
import { ChangePasswordAgUserDto } from '../dto/change-password-ag-user.dto';
import { ForgotPasswordAgUserDto } from '../dto/forgot-password-ag-user.dto';
import { CheckResetCodeAgUserDto } from '../dto/check-reset-code-ag-user.dto';
import { ResetPasswordAgUserDto } from '../dto/reset-password-ag-user.dto';
import { GetAllAgUsersQueryDto } from '../dto/get-all-ag-users.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { AgUsersControllerDocs } from '../docs/ag-users.swagger';

/**
 * AgUsers Admin Controller
 * Handles all admin user (ag_users) endpoints matching Yii AgUsersController
 * Base route: /admin/ag-users
 */
@Controller('admin/ag-users')
@AgUsersControllerDocs.controller()
export class AgUsersAdminController {
  private readonly logger = new Logger(AgUsersAdminController.name);

  constructor(private readonly agUsersAdminService: AgUsersAdminService) {
    this.logger.log('AgUsersAdminController initialized');
  }

  /**
   * Extract token from request
   */
  private extractToken(req: Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }
    return authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
  }

  /**
   * Get languages
   */
  @Get('languages')
  @AgUsersControllerDocs.getLanguages()
  async getLanguages(@Req() req: Request) {
    const token = this.extractToken(req);
    return this.agUsersAdminService.getLanguages(token);
  }

  /**
   * Create user
   */
  @Post('create')
  @AgUsersControllerDocs.createUser()
  async createUser(@Req() req: Request, @Body() dto: CreateAgUserDto) {
    const token = this.extractToken(req);
    const authUserId = await this.agUsersAdminService.requireAuth(token);
    return this.agUsersAdminService.createUser(dto, authUserId);
  }

  /**
   * Get user by ID
   */
  @Get(':id')
  @AgUsersControllerDocs.getUser()
  async getUser(@Req() req: Request, @Param('id') id: string) {
    const token = this.extractToken(req);
    return this.agUsersAdminService.getUserById(id, token);
  }

  /**
   * Get all users
   */
  @Get()
  @AgUsersControllerDocs.getAllUsers()
  async getAllUsers(@Req() req: Request, @Query() query: GetAllAgUsersQueryDto) {
    const startTime = Date.now();
    const method = req.method;
    const url = req.url;
    const queryParams = JSON.stringify(query);

    this.logger.log(`[${method}] ${url} - getAllUsers called`);
    this.logger.debug(`Query parameters: ${queryParams}`);
    this.logger.debug(`Request headers: ${JSON.stringify(req.headers)}`);
    
    try {
      const token = this.extractToken(req);
      this.logger.debug(`Token extracted: ${token ? token.substring(0, 20) + '...' : 'null'}`);
      
      this.logger.debug(`Validating token...`);
      const authUserId = await this.agUsersAdminService.requireAuth(token);
      this.logger.debug(`Token validated, authUserId: ${authUserId}`);
      
      this.logger.debug(`Calling getAllUsers service with query: ${queryParams}`);
      const result = await this.agUsersAdminService.getAllUsers(query, authUserId);
      
      const duration = Date.now() - startTime;
      this.logger.log(`[${method}] ${url} - getAllUsers completed in ${duration}ms`);
      this.logger.debug(`Result count: ${result?.users?.length || 0} users`);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`[${method}] ${url} - getAllUsers failed after ${duration}ms`);
      this.logger.error(`Error: ${error?.message}`);
      this.logger.error(`Error stack: ${error?.stack}`);
      throw error;
    }
  }

  /**
   * Update user
   */
  @Patch(':id')
  @AgUsersControllerDocs.updateUser()
  async updateUser(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateAgUserDto,
  ) {
    const token = this.extractToken(req);
    const authUserId = await this.agUsersAdminService.requireAuth(token);
    return this.agUsersAdminService.updateUser(id, dto, authUserId);
  }

  /**
   * Delete user(s)
   */
  @Delete()
  @AgUsersControllerDocs.deleteUser()
  async deleteUser(@Req() req: Request, @Body() dto: DeleteAgUserDto) {
    const token = this.extractToken(req);
    const authUserId = await this.agUsersAdminService.requireAuth(token);
    return this.agUsersAdminService.deleteUser(dto, authUserId);
  }

  /**
   * Login (public endpoint)
   */
  @Post('login')
  @Public()
  @AgUsersControllerDocs.login()
  async login(@Body() dto: LoginAgUserDto) {
    return this.agUsersAdminService.login(dto);
  }

  /**
   * Change password
   */
  @Post('change-password')
  @AgUsersControllerDocs.changePassword()
  async changePassword(@Req() req: Request, @Body() dto: ChangePasswordAgUserDto) {
    const token = this.extractToken(req);
    const authUserId = await this.agUsersAdminService.requireAuth(token);
    return this.agUsersAdminService.changePassword(dto, authUserId);
  }

  /**
   * Forgot password (public endpoint)
   */
  @Post('forgot-password')
  @Public()
  @AgUsersControllerDocs.forgotPassword()
  async forgotPassword(@Body() dto: ForgotPasswordAgUserDto) {
    return this.agUsersAdminService.forgotPassword(dto);
  }

  /**
   * Check reset code (public endpoint)
   */
  @Post('check-reset-code')
  @Public()
  @AgUsersControllerDocs.checkResetCode()
  async checkResetCode(@Body() dto: CheckResetCodeAgUserDto) {
    return this.agUsersAdminService.checkResetCode(dto);
  }

  /**
   * Reset password (public endpoint)
   */
  @Post('reset-password')
  @Public()
  @AgUsersControllerDocs.resetPassword()
  async resetPassword(@Body() dto: ResetPasswordAgUserDto) {
    return this.agUsersAdminService.resetPassword(dto);
  }

  /**
   * Get permissions
   */
  @Get('permissions/me')
  @AgUsersControllerDocs.getPermissions()
  async getPermissions(@Req() req: Request) {
    const token = this.extractToken(req);
    const authUserId = await this.agUsersAdminService.requireAuth(token);
    return this.agUsersAdminService.getPermissions(authUserId);
  }
}
