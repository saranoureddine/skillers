import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgBoardListsEntity } from './entities/ag-board-lists.entity';
import { AgBoardSettingsEntity } from './entities/ag-board-settings.entity';
import { AgCardsOrderEntity } from './entities/ag-cards-order.entity';

/**
 * Boards Module
 * 
 * This module provides shared entities for board management.
 * These entities are used across multiple modules but don't have dedicated controllers.
 * 
 * Entities:
 * - AgBoardListsEntity: Board lists/columns
 * - AgBoardSettingsEntity: Board configuration settings
 * - AgCardsOrderEntity: Card ordering information
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgBoardListsEntity,
      AgBoardSettingsEntity,
      AgCardsOrderEntity,
    ]),
  ],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule], // Export TypeOrmModule so other modules can use these entities
})
export class BoardsModule {}
