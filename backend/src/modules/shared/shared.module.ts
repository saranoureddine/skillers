import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgChatsEntity } from './entities/ag-chats.entity';
import { AgDashboardEntity } from './entities/ag-dashboard.entity';
import { AgDashboardDataEntity } from './entities/ag-dashboard-data.entity';
import { AgDashboardPluginsEntity } from './entities/ag-dashboard-plugins.entity';
import { AgDataSourceEntity } from './entities/ag-data-source.entity';
import { AgDeletedRecordsEntity } from './entities/ag-deleted-records.entity';
import { AgExportEntity } from './entities/ag-export.entity';
import { AgExternalAppsEntity } from './entities/ag-external-apps.entity';
import { AgFiltersEntity } from './entities/ag-filters.entity';
import { AgGridsEntity } from './entities/ag-grids.entity';
import { AgGridsLabelsEntity } from './entities/ag-grids-labels.entity';
import { AgGridsSettingsEntity } from './entities/ag-grids-settings.entity';
import { AgImportLogEntity } from './entities/ag-import-log.entity';
import { AgImportSynonymsEntity } from './entities/ag-import-synonyms.entity';
import { AgLabelCategoriesEntity } from './entities/ag-label-categories.entity';

/**
 * Shared Module
 * 
 * This module provides shared entities that don't have dedicated controllers.
 * These entities are used across multiple modules.
 * 
 * Entities:
 * - AgChatsEntity: Chat messages
 * - AgDashboardEntity: Dashboard configuration
 * - AgDashboardDataEntity: Dashboard data/widgets
 * - AgDashboardPluginsEntity: Dashboard plugins
 * - AgDataSourceEntity: Data source configuration
 * - AgDeletedRecordsEntity: Deleted records tracking
 * - AgExportEntity: Export configuration
 * - AgExternalAppsEntity: External applications configuration
 * - AgFiltersEntity: Grid filters
 * - AgGridsEntity: Grid configuration
 * - AgGridsLabelsEntity: Grid field labels
 * - AgGridsSettingsEntity: Grid settings configuration
 * - AgImportLogEntity: Import log tracking
 * - AgImportSynonymsEntity: Import synonyms mapping
 * - AgLabelCategoriesEntity: Label categories
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgChatsEntity,
      AgDashboardEntity,
      AgDashboardDataEntity,
      AgDashboardPluginsEntity,
      AgDataSourceEntity,
      AgDeletedRecordsEntity,
      AgExportEntity,
      AgExternalAppsEntity,
      AgFiltersEntity,
      AgGridsEntity,
      AgGridsLabelsEntity,
      AgGridsSettingsEntity,
      AgImportLogEntity,
      AgImportSynonymsEntity,
      AgLabelCategoriesEntity,
    ]),
  ],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule], // Export TypeOrmModule so other modules can use these entities
})
export class SharedModule {}
