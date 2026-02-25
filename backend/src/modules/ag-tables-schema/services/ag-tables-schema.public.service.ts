import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { AgTablesSchemaEntity } from '../entities/ag-tables-schema.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { GetTablesDto } from '../dto';

/**
 * Public/user-facing service — handles all ag tables schema endpoints matching Yii API
 */
@Injectable()
export class AgTablesSchemaPublicService {
  // Allowed keys with display titles
  private readonly allowedKeys: Record<string, string> = {
    admin_dashboard: 'Admin Dashboard',
    municipality_dashboard: 'Municipality Dashboard',
    users: 'Users',
    dashboard_users: 'Dashboard Users',
    municipality: 'Municipality',
    news: 'News',
    breaking_news: 'Breaking News',
    news_categories: 'News Categories',
    stores: 'Stores',
    store_categories: 'Store Categories',
    restaurants: 'Restaurants',
    restaurant_categories: 'Restaurant Categories',
    buy_sell: 'Buy & Sell',
    buy_sell_categories: 'Buy & Sell Categories',
    buy_sell_slider: 'Buy & Sell Slider',
    lost_items: 'Lost Items',
    found_items: 'Found Items',
    lost_found_categories: 'Lost & Found Categories',
    delivery_men: 'Delivery Men',
    delivery_categories: 'Delivery Categories',
    notifications: 'Announcements',
    suggestions_claims: 'Suggestions & Claims',
    suggestions_claims_categories: 'Suggestions & Claims Categories',
    slider_data: 'Homepage Slider',
    modules: 'Modules',
    ag_user_groups: 'Roles',
    user_requests: 'User Requests',
    prof_categories: 'Professions Categories',
    professions: 'Professions',
    sos: 'SOS',
  };

  constructor(
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
   * Get tables with permissions (actionGetTables)
   * Matches Yii implementation exactly
   */
  async getTables(dto: GetTablesDto): Promise<any> {
    try {
      // Get group name
      const groupName = await this.dataSource
        .createQueryBuilder()
        .select('group_name')
        .from('ag_user_groups', 'ag_user_groups')
        .where('id = :groupId', { groupId: dto.groupId })
        .getRawOne();

      if (!groupName) {
        throw new BadRequestException('Invalid group_id');
      }

      const groupNameValue = groupName.group_name;

      // Fetch all allowed tables from DB
      const allowedTableNames = Object.keys(this.allowedKeys);
      // Map special keys for lookup
      const lookupTableNames = allowedTableNames.map((key) => {
        if (key === 'delivery_categories') return 'delivery_cat';
        if (key === 'dashboard_users') return 'ag_users';
        if (key === 'user_requests') return 'user_requests';
        return key;
      });

      // Combine all table names (remove duplicates)
      const allTableNames = [...new Set([...allowedTableNames, ...lookupTableNames])];

      const tables = await this.agTablesSchemaRepository.find({
        where: {
          tableName: In(allTableNames),
        },
      });

      const result: Record<string, any> = {};

      for (const [key, title] of Object.entries(this.allowedKeys)) {
        // Skip "roles" if Admin
        if (groupNameValue === 'Admin' && key === 'ag_user_groups') {
          continue;
        }

        // Default permissions
        let permissions = {
          view: 0,
          create: 0,
          update: 0,
          delete: 0,
        };

        // Map special keys to different DB table_name values
        let lookupKey = key;
        if (key === 'delivery_categories') {
          lookupKey = 'delivery_cat';
        } else if (key === 'dashboard_users') {
          lookupKey = 'ag_users';
        } else if (key === 'user_requests') {
          lookupKey = 'user_requests';
        }

        // Find the table in DB
        const table = tables.find((t) => t.tableName === lookupKey);

        if (table) {
          // Get permission from DB
          const permission = await this.dataSource
            .createQueryBuilder()
            .select('*')
            .from('ag_permissions', 'ag_permissions')
            .where('table_id = :tableId', { tableId: table.id })
            .andWhere('group_id = :groupId', { groupId: dto.groupId })
            .getRawOne();

          if (permission) {
            permissions = {
              view: parseInt(permission.view) || 0,
              create: parseInt(permission.create) || 0,
              update: parseInt(permission.update) || 0,
              delete: parseInt(permission.delete) || 0,
            };
          }
        }

        // Keep key and title in output
        result[key] = {
          title,
          permissions,
        };
      }

      return {
        succeeded: true,
        tables: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Server error: ' + error.message,
      );
    }
  }
}
