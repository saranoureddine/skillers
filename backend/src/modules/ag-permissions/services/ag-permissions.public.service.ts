import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { AgPermissionEntity } from '../entities/ag-permission.entity';
import { AgTablesSchemaEntity } from '../../ag-tables-schema/entities/ag-tables-schema.entity';
import { UserEntity } from '../../users/entities/user.entity';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  GetPermissionDto,
  GetAllPermissionsDto,
  DeletePermissionDto,
} from '../dto';
import * as crypto from 'crypto';

/**
 * Public/user-facing service — handles all ag permissions endpoints matching Yii API
 */
@Injectable()
export class AgPermissionsPublicService {
  constructor(
    @InjectRepository(AgPermissionEntity)
    private readonly agPermissionsRepository: Repository<AgPermissionEntity>,
    @InjectRepository(AgTablesSchemaEntity)
    private readonly agTablesSchemaRepository: Repository<AgTablesSchemaEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find user by token (for authentication)
   */
  async findUserByToken(token: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { token, isActivated: 1 },
    });
  }

  /**
   * Generate unique 20-character ID
   */
  private generateUniqueId(): string {
    return crypto.randomBytes(10).toString('hex').substring(0, 20);
  }

  /**
   * Map table name to database table_name
   */
  private mapTableName(tableName: string): string {
    if (tableName === 'delivery_categories') {
      return 'delivery_cat';
    } else if (tableName === 'dashboard_users') {
      return 'ag_users';
    }
    return tableName;
  }

  /**
   * Create permission (actionCreatePermission)
   * Matches Yii implementation exactly
   */
  async createPermission(
    createdBy: string,
    dto: CreatePermissionDto,
  ): Promise<any> {
    try {
      // Validate that either user_id or group_id is provided
      if (!dto.userId && !dto.groupId) {
        throw new BadRequestException(
          'Either user_id or group_id must be provided',
        );
      }

      // Map table name if needed
      const mappedTableName = this.mapTableName(dto.tableId);

      // Find table in ag_tables_schema
      const table = await this.agTablesSchemaRepository.findOne({
        where: { tableName: mappedTableName },
        select: ['id'],
      });

      if (!table) {
        throw new NotFoundException('Table Not Found');
      }

      // Check if a permission already exists for this group_id and table_id
      let existing: AgPermissionEntity | null;
      if (dto.groupId !== null && dto.groupId !== undefined) {
        existing = await this.agPermissionsRepository.findOne({
          where: {
            groupId: dto.groupId,
            tableId: table.id,
          },
        });
      } else {
        existing = await this.agPermissionsRepository.findOne({
          where: {
            groupId: IsNull(),
            tableId: table.id,
          },
        });
      }

      // Use existing model if found, else create new
      let permission: AgPermissionEntity;
      const isNewRecord = !existing;

      if (existing) {
        permission = existing;
      } else {
        permission = this.agPermissionsRepository.create({
          id: dto.id || this.generateUniqueId(),
          tableId: table.id,
          groupId: dto.groupId ?? null,
          userId: dto.userId ?? null,
          centerNum: dto.centerNum ?? 0,
          createdBy,
          updatedBy: createdBy,
        } as Partial<AgPermissionEntity>);
      }

      // Set permission flags
      permission.create = dto.create !== undefined ? (dto.create ? 1 : 0) : 0;
      permission.view = dto.view !== undefined ? (dto.view ? 1 : 0) : 0;
      permission.update = dto.update !== undefined ? (dto.update ? 1 : 0) : 0;
      permission.delete = dto.delete !== undefined ? (dto.delete ? 1 : 0) : 0;

      if (dto.condition !== undefined) {
        permission.condition = dto.condition;
      }

      if (dto.centerNum !== undefined) {
        permission.centerNum = dto.centerNum;
      }

      permission.updatedBy = createdBy;

      await this.agPermissionsRepository.save(permission);

      return {
        succeeded: true,
        permission: {
          id: permission.id,
          table_id: permission.tableId,
          user_id: permission.userId,
          group_id: permission.groupId,
          create: permission.create,
          view: permission.view,
          update: permission.update,
          delete: permission.delete,
          condition: permission.condition,
          created_by: permission.createdBy,
          updated_by: permission.updatedBy,
          created_at: permission.createdAt,
          updated_at: permission.updatedAt,
          center_num: permission.centerNum,
        },
        message: isNewRecord ? 'Permission created' : 'Permission updated',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create permission: ' + error.message,
      );
    }
  }

  /**
   * Get permission (actionGetPermission)
   * Matches Yii implementation exactly
   */
  async getPermission(dto: GetPermissionDto): Promise<any> {
    try {
      const permission = await this.agPermissionsRepository.findOne({
        where: { id: dto.id },
      });

      if (!permission) {
        throw new NotFoundException('Permission not found');
      }

      return {
        succeeded: true,
        permission: {
          id: permission.id,
          table_id: permission.tableId,
          user_id: permission.userId,
          group_id: permission.groupId,
          create: permission.create,
          view: permission.view,
          update: permission.update,
          delete: permission.delete,
          condition: permission.condition,
          created_by: permission.createdBy,
          updated_by: permission.updatedBy,
          created_at: permission.createdAt,
          updated_at: permission.updatedAt,
          center_num: permission.centerNum,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to get permission: ' + error.message,
      );
    }
  }

  /**
   * Update permission (actionUpdatePermission)
   * Matches Yii implementation exactly
   */
  async updatePermission(
    id: string,
    updatedBy: string,
    dto: UpdatePermissionDto,
  ): Promise<any> {
    try {
      const permission = await this.agPermissionsRepository.findOne({
        where: { id },
      });

      if (!permission) {
        throw new NotFoundException('Permission not found');
      }

      // Update permission flags if provided
      if (dto.create !== undefined) {
        permission.create = dto.create ? 1 : 0;
      }
      if (dto.view !== undefined) {
        permission.view = dto.view ? 1 : 0;
      }
      if (dto.update !== undefined) {
        permission.update = dto.update ? 1 : 0;
      }
      if (dto.delete !== undefined) {
        permission.delete = dto.delete ? 1 : 0;
      }
      if (dto.condition !== undefined) {
        permission.condition = dto.condition;
      }
      if (dto.centerNum !== undefined) {
        permission.centerNum = dto.centerNum;
      }

      permission.updatedBy = updatedBy;
      await this.agPermissionsRepository.save(permission);

      return {
        succeeded: true,
        permission: {
          id: permission.id,
          table_id: permission.tableId,
          user_id: permission.userId,
          group_id: permission.groupId,
          create: permission.create,
          view: permission.view,
          update: permission.update,
          delete: permission.delete,
          condition: permission.condition,
          created_by: permission.createdBy,
          updated_by: permission.updatedBy,
          created_at: permission.createdAt,
          updated_at: permission.updatedAt,
          center_num: permission.centerNum,
        },
        message: 'Permission updated',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update permission: ' + error.message,
      );
    }
  }

  /**
   * Delete permission (actionDeletePermission)
   * Matches Yii implementation exactly
   */
  async deletePermission(dto: DeletePermissionDto): Promise<any> {
    try {
      const permission = await this.agPermissionsRepository.findOne({
        where: { id: dto.id },
      });

      if (!permission) {
        throw new NotFoundException('Permission not found');
      }

      await this.agPermissionsRepository.remove(permission);

      return {
        succeeded: true,
        message: 'Permission deleted',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete permission: ' + error.message,
      );
    }
  }

  /**
   * Get all permissions (actionGetAllPermissions)
   * Matches Yii implementation exactly
   */
  async getAllPermissions(dto: GetAllPermissionsDto): Promise<any> {
    try {
      const page = dto.page || 1;
      const perPage = dto.perPage || 20;
      const offset = (page - 1) * perPage;

      // Build query with join to ag_tables_schema
      const query = this.dataSource
        .createQueryBuilder()
        .select([
          'ag_permissions.id AS id',
          'ag_permissions.table_id AS table_id',
          'ag_permissions.user_id AS user_id',
          'ag_permissions.group_id AS group_id',
          'ag_permissions.create AS create',
          'ag_permissions.view AS view',
          'ag_permissions.update AS update',
          'ag_permissions.delete AS delete',
          'ag_permissions.condition AS condition',
          'ag_permissions.created_by AS created_by',
          'ag_permissions.updated_by AS updated_by',
          'ag_permissions.created_at AS created_at',
          'ag_permissions.updated_at AS updated_at',
          'ag_permissions.center_num AS center_num',
          'c.table_name AS table_name',
        ])
        .from(AgPermissionEntity, 'ag_permissions')
        .leftJoin(
          AgTablesSchemaEntity,
          'c',
          'c.id = ag_permissions.table_id',
        );

      // Apply filters
      if (dto.userId) {
        query.andWhere('ag_permissions.user_id = :userId', {
          userId: dto.userId,
        });
      }
      if (dto.groupId) {
        query.andWhere('ag_permissions.group_id = :groupId', {
          groupId: dto.groupId,
        });
      }

      // Get total count
      const totalCount = await query.getCount();

      // Get paginated results
      const permissions = await query
        .offset(offset)
        .limit(perPage)
        .getRawMany();

      const permissionsData = permissions.map((perm: any) => ({
        id: perm.id,
        table_id: perm.table_id,
        user_id: perm.user_id,
        group_id: perm.group_id,
        create: perm.create,
        view: perm.view,
        update: perm.update,
        delete: perm.delete,
        condition: perm.condition,
        created_by: perm.created_by,
        updated_by: perm.updated_by,
        created_at: perm.created_at,
        updated_at: perm.updated_at,
        center_num: perm.center_num,
        table_name: perm.table_name,
      }));

      const pageCount = Math.ceil(totalCount / perPage);

      return {
        succeeded: true,
        permissions: permissionsData,
        pagination: {
          total_count: totalCount,
          page_count: pageCount,
          current_page: page,
          per_page: perPage,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to get permissions: ' + error.message,
      );
    }
  }
}
