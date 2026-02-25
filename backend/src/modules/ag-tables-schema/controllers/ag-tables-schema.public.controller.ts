import {
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AgTablesSchemaPublicService } from '../services/ag-tables-schema.public.service';
import { GetTablesDto } from '../dto';
import { Public } from '../../../common/decorators/public.decorator';
import { AgTablesSchemaPublicControllerDocs } from '../docs/ag-tables-schema.swagger';

/**
 * Public Ag Tables Schema Controller — handles all ag tables schema endpoints matching Yii API
 * All routes prefixed with /public/ag-tables-schema
 */
@Controller('public/ag-tables-schema')
@AgTablesSchemaPublicControllerDocs.controller()
export class AgTablesSchemaPublicController {
  constructor(
    private readonly agTablesSchemaPublicService: AgTablesSchemaPublicService,
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

    const user = await this.agTablesSchemaPublicService.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user.id;
  }

  @Get('get-tables')
  @Public() // Temporarily public - will validate token manually
  @AgTablesSchemaPublicControllerDocs.getTables()
  async getTables(@Req() req: Request, @Query() dto: GetTablesDto) {
    await this.validateToken(req); // Validate token
    return this.agTablesSchemaPublicService.getTables(dto);
  }
}
