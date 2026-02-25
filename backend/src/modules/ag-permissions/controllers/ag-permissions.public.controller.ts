import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AgPermissionsPublicService } from '../services/ag-permissions.public.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  GetPermissionDto,
  GetAllPermissionsDto,
  DeletePermissionDto,
} from '../dto';
import { Public } from '../../../common/decorators/public.decorator';
import { AgPermissionsPublicControllerDocs } from '../docs/ag-permissions.swagger';

/**
 * Public Ag Permissions Controller — handles all ag permissions endpoints matching Yii API
 * All routes prefixed with /public/ag-permissions
 */
@Controller('public/ag-permissions')
@AgPermissionsPublicControllerDocs.controller()
export class AgPermissionsPublicController {
  constructor(
    private readonly agPermissionsPublicService: AgPermissionsPublicService,
  ) {}

  /**
   * Helper method to extract and validate token
   */
  private async validateToken(req: Request): Promise<string> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const token = authHeader.replace(/^(Bearer|Token)\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.agPermissionsPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user.id;
  }

  @Post('create-permission')
  @Public() // Temporarily public - will validate token manually
  @AgPermissionsPublicControllerDocs.createPermission()
  async createPermission(
    @Req() req: Request,
    @Body() dto: CreatePermissionDto,
  ) {
    const createdBy = await this.validateToken(req);
    return this.agPermissionsPublicService.createPermission(createdBy, dto);
  }

  @Get('get-permission')
  @Public() // Temporarily public - will validate token manually
  @AgPermissionsPublicControllerDocs.getPermission()
  async getPermission(@Req() req: Request, @Query() dto: GetPermissionDto) {
    await this.validateToken(req); // Validate token
    return this.agPermissionsPublicService.getPermission(dto);
  }

  @Post('update-permission')
  @Public() // Temporarily public - will validate token manually
  @AgPermissionsPublicControllerDocs.updatePermission()
  async updatePermission(
    @Req() req: Request,
    @Query() query: GetPermissionDto,
    @Body() dto: UpdatePermissionDto,
  ) {
    const updatedBy = await this.validateToken(req);
    return this.agPermissionsPublicService.updatePermission(
      query.id,
      updatedBy,
      dto,
    );
  }

  @Delete('delete-permission')
  @Public() // Temporarily public - will validate token manually
  @AgPermissionsPublicControllerDocs.deletePermission()
  async deletePermission(@Req() req: Request, @Query() dto: DeletePermissionDto) {
    await this.validateToken(req); // Validate token
    return this.agPermissionsPublicService.deletePermission(dto);
  }

  @Get('get-all-permissions')
  @Public() // Temporarily public - will validate token manually
  @AgPermissionsPublicControllerDocs.getAllPermissions()
  async getAllPermissions(
    @Req() req: Request,
    @Query() dto: GetAllPermissionsDto,
  ) {
    await this.validateToken(req); // Validate token
    return this.agPermissionsPublicService.getAllPermissions(dto);
  }
}
