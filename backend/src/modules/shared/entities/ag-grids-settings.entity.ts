import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AgGridsSettings Entity matching Yii AgGridsSettings model structure
 * Table: ag_grids_settings
 */
@Entity('ag_grids_settings')
@Index(['tableName'])
export class AgGridsSettingsEntity {
  @ApiProperty({
    description: 'Settings ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({
    description: 'Table ID',
    example: 210,
    nullable: true,
  })
  @Column({ name: 'table_id', type: 'int', nullable: true })
  tableId: number | null;

  @ApiProperty({
    description: 'Table name',
    example: 'users',
    maxLength: 50,
  })
  @Column({ name: 'table_name', type: 'varchar', length: 50 })
  tableName: string;

  @ApiProperty({
    description: 'Primary key column name',
    example: 'id',
    maxLength: 20,
  })
  @Column({ name: 'primary_key', type: 'varchar', length: 20 })
  primaryKey: string;

  @ApiPropertyOptional({
    description: 'Image columns (comma-separated)',
    example: 'main_image,cover_image',
    maxLength: 250,
    nullable: true,
  })
  @Column({ name: 'images_columns', type: 'varchar', length: 250, nullable: true })
  imagesColumns: string | null;

  @ApiProperty({
    description: 'Sorting columns',
    example: 'id DESC, name ASC',
    maxLength: 100,
  })
  @Column({ name: 'sorting_columns', type: 'varchar', length: 100 })
  sortingColumns: string;

  @ApiPropertyOptional({
    description: 'Filter conditions',
    example: 'status = "active"',
    maxLength: 100,
    nullable: true,
  })
  @Column({ name: 'filter_conditions', type: 'varchar', length: 100, nullable: true })
  filterConditions: string | null;

  @ApiPropertyOptional({
    description: 'Selected row color',
    example: '#ff0000',
    maxLength: 20,
    nullable: true,
  })
  @Column({ name: 'selected_row_color', type: 'varchar', length: 20, nullable: true })
  selectedRowColor: string | null;

  @ApiPropertyOptional({
    description: 'Initial row numbers',
    example: 10,
    nullable: true,
  })
  @Column({ name: 'initial_row_numbers', type: 'int', nullable: true })
  initialRowNumbers: number | null;

  @ApiPropertyOptional({
    description: 'Text align',
    example: 'left',
    maxLength: 10,
    nullable: true,
  })
  @Column({ name: 'text_align', type: 'varchar', length: 10, nullable: true })
  textAlign: string | null;

  @ApiPropertyOptional({
    description: 'Table direction',
    example: 'ltr',
    maxLength: 10,
    nullable: true,
  })
  @Column({ name: 'table_direction', type: 'varchar', length: 10, nullable: true })
  tableDirection: string | null;

  @ApiPropertyOptional({
    description: 'Bulk select active flag',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'bulk_select_active', type: 'int', nullable: true })
  bulkSelectActive: number | null;

  @ApiPropertyOptional({
    description: 'Bulk selected color',
    example: '#00ff00',
    maxLength: 10,
    nullable: true,
  })
  @Column({ name: 'bulk_selected_color', type: 'varchar', length: 10, nullable: true })
  bulkSelectedColor: string | null;

  @ApiPropertyOptional({
    description: 'Label text color',
    example: '#000000',
    maxLength: 10,
    nullable: true,
  })
  @Column({ name: 'label_text_color', type: 'varchar', length: 10, nullable: true })
  labelTextColor: string | null;

  @ApiPropertyOptional({
    description: 'Label background color',
    example: '#ffffff',
    maxLength: 10,
    nullable: true,
  })
  @Column({ name: 'label_background_color', type: 'varchar', length: 10, nullable: true })
  labelBackgroundColor: string | null;

  @ApiPropertyOptional({
    description: 'Collapse active flag',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'collapse_active', type: 'int', nullable: true })
  collapseActive: number | null;

  @ApiPropertyOptional({
    description: 'Collapse URL',
    example: '/api/users/details',
    maxLength: 200,
    nullable: true,
  })
  @Column({ name: 'collapse_url', type: 'varchar', length: 200, nullable: true })
  collapseUrl: string | null;

  @ApiPropertyOptional({
    description: 'Context item configuration',
    nullable: true,
  })
  @Column({ name: 'contextItem', type: 'text', nullable: true })
  contextItem: string | null;

  @ApiPropertyOptional({
    description: 'Boolean columns',
    nullable: true,
  })
  @Column({ name: 'booleanCol', type: 'text', nullable: true })
  booleanCol: string | null;

  @ApiPropertyOptional({
    description: 'Column sum configuration',
    example: 'amount,quantity',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'column_sum', type: 'varchar', length: 255, nullable: true })
  columnSum: string | null;

  @ApiPropertyOptional({
    description: 'Custom columns',
    nullable: true,
  })
  @Column({ name: 'customCol', type: 'text', nullable: true })
  customCol: string | null;

  @ApiPropertyOptional({
    description: 'Childs configuration',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  childs: string | null;

  @ApiPropertyOptional({
    description: 'Foreigns configuration',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  foreigns: string | null;

  @ApiPropertyOptional({
    description: 'Foreign keys configuration',
    nullable: true,
  })
  @Column({ name: 'foreign_keys', type: 'text', nullable: true })
  foreignKeys: string | null;

  @ApiPropertyOptional({
    description: 'Table mapping',
    nullable: true,
  })
  @Column({ name: 'table_mapping', type: 'text', nullable: true })
  tableMapping: string | null;

  @ApiPropertyOptional({
    description: 'Childs display',
    example: 'inline',
    maxLength: 10,
    nullable: true,
  })
  @Column({ name: 'childs_display', type: 'varchar', length: 10, nullable: true })
  childsDisplay: string | null;

  @ApiPropertyOptional({
    description: 'Attachment availability flag',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'attachment_availability', type: 'int', nullable: true })
  attachmentAvailability: number | null;

  @ApiPropertyOptional({
    description: 'Attachment counter column',
    example: 'attachment_counter',
    maxLength: 100,
    nullable: true,
  })
  @Column({ name: 'attachment_counter', type: 'varchar', length: 100, nullable: true })
  attachmentCounter: string | null;

  @ApiPropertyOptional({
    description: 'Attachment kinds',
    example: '1,2,3',
    maxLength: 100,
    nullable: true,
  })
  @Column({ name: 'attachment_kinds', type: 'varchar', length: 100, nullable: true })
  attachmentKinds: string | null;

  @ApiPropertyOptional({
    description: 'Icon class',
    example: 'fa fa-users',
    maxLength: 100,
    nullable: true,
  })
  @Column({ name: 'icon_class', type: 'varchar', length: 100, nullable: true })
  iconClass: string | null;

  @ApiPropertyOptional({
    description: 'Navigation label',
    example: 'Users',
    maxLength: 100,
    nullable: true,
  })
  @Column({ name: 'nav_label', type: 'varchar', length: 100, nullable: true })
  navLabel: string | null;

  @ApiPropertyOptional({
    description: 'Navigation action',
    example: '/users',
    maxLength: 100,
    nullable: true,
  })
  @Column({ name: 'nav_action', type: 'varchar', length: 100, nullable: true })
  navAction: string | null;

  @ApiPropertyOptional({
    description: 'Navigation parent ID',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'nav_parent', type: 'int', nullable: true })
  navParent: number | null;

  @ApiPropertyOptional({
    description: 'Navigation display flag',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'nav_display', type: 'int', nullable: true })
  navDisplay: number | null;

  @ApiPropertyOptional({
    description: 'After create hook',
    nullable: true,
  })
  @Column({ name: 'after_create', type: 'text', nullable: true })
  afterCreate: string | null;

  @ApiPropertyOptional({
    description: 'After update hook',
    nullable: true,
  })
  @Column({ name: 'after_update', type: 'text', nullable: true })
  afterUpdate: string | null;

  @ApiPropertyOptional({
    description: 'After delete hook',
    nullable: true,
  })
  @Column({ name: 'after_delete', type: 'text', nullable: true })
  afterDelete: string | null;

  @ApiPropertyOptional({
    description: 'Trigger inline code',
    nullable: true,
  })
  @Column({ name: 'trigger_inline_code', type: 'text', nullable: true })
  triggerInlineCode: string | null;

  @ApiPropertyOptional({
    description: 'Record creation timestamp',
    example: '2026-02-24T12:00:00.000Z',
    nullable: true,
  })
  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date | null;

  @ApiPropertyOptional({
    description: 'Record update timestamp',
    example: '2026-02-24T12:00:00.000Z',
    nullable: true,
  })
  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Has reminder flag',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'has_reminder', type: 'int', nullable: true })
  hasReminder: number | null;

  @ApiPropertyOptional({
    description: 'Due date field name',
    example: 'due_date',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'due_date_field', type: 'varchar', length: 255, nullable: true })
  dueDateField: string | null;

  @ApiPropertyOptional({
    description: 'Remind before (days)',
    example: 7,
    nullable: true,
  })
  @Column({ name: 'remind_before', type: 'int', nullable: true })
  remindBefore: number | null;

  @ApiPropertyOptional({
    description: 'Send reminder to',
    example: 'assignee',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'send_reminder_to', type: 'varchar', length: 255, nullable: true })
  sendReminderTo: string | null;

  @ApiPropertyOptional({
    description: 'Has file manager flag',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'has_file_manager', type: 'int', nullable: true })
  hasFileManager: number | null;

  @ApiProperty({
    description: 'Presentable field name',
    example: 'name',
    maxLength: 255,
  })
  @Column({ name: 'presentable_field', type: 'varchar', length: 255 })
  presentableField: string;

  @ApiPropertyOptional({
    description: 'Folder directories',
    nullable: true,
  })
  @Column({ name: 'folder_dirs', type: 'text', nullable: true })
  folderDirs: string | null;

  @ApiPropertyOptional({
    description: 'Additional field configuration',
    nullable: true,
  })
  @Column({ name: 'additional_field', type: 'text', nullable: true })
  additionalField: string | null;

  @ApiPropertyOptional({
    description: 'Allow creator only flag',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'allow_creator_only', type: 'int', nullable: true })
  allowCreatorOnly: number | null;

  @ApiPropertyOptional({
    description: 'D search condition',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'd_search_condition', type: 'int', nullable: true })
  dSearchCondition: number | null;

  @ApiProperty({
    description: 'Form structure',
    example: 1,
  })
  @Column({ name: 'form_structure', type: 'int' })
  formStructure: number;

  @ApiProperty({
    description: 'Open explorer flag',
    example: 1,
  })
  @Column({ name: 'open_explorer', type: 'int' })
  openExplorer: number;

  @ApiPropertyOptional({
    description: 'Open explorer field',
    example: 'file_path',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'open_explorer_field', type: 'varchar', length: 255, nullable: true })
  openExplorerField: string | null;

  @ApiPropertyOptional({
    description: 'Notification send to',
    example: 'all',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'notif_send_to', type: 'varchar', length: 255, nullable: true })
  notifSendTo: string | null;

  @ApiPropertyOptional({
    description: 'Notification send users IDs',
    nullable: true,
  })
  @Column({ name: 'notif_send_users_ids', type: 'text', nullable: true })
  notifSendUsersIds: string | null;

  @ApiPropertyOptional({
    description: 'Notification send columns',
    nullable: true,
  })
  @Column({ name: 'notif_send_columns', type: 'text', nullable: true })
  notifSendColumns: string | null;

  @ApiPropertyOptional({
    description: 'Notification send on event',
    example: 'create,update',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'notif_send_on_event', type: 'varchar', length: 255, nullable: true })
  notifSendOnEvent: string | null;

  @ApiPropertyOptional({
    description: 'Notification event message',
    nullable: true,
  })
  @Column({ name: 'notif_event_msg', type: 'text', nullable: true })
  notifEventMsg: string | null;

  @ApiPropertyOptional({
    description: 'Apply format fields',
    nullable: true,
  })
  @Column({ name: 'apply_format_fields', type: 'text', nullable: true })
  applyFormatFields: string | null;

  @ApiPropertyOptional({
    description: 'Sort create form',
    nullable: true,
  })
  @Column({ name: 'sort_create_form', type: 'text', nullable: true })
  sortCreateForm: string | null;

  @ApiProperty({
    description: 'Has group by count flag',
    example: 1,
  })
  @Column({ name: 'has_group_by_count', type: 'int' })
  hasGroupByCount: number;

  @ApiPropertyOptional({
    description: 'About table description',
    nullable: true,
  })
  @Column({ name: 'about_table', type: 'text', nullable: true })
  aboutTable: string | null;

  @ApiProperty({
    description: 'Owner center',
    example: 10,
  })
  @Column({ name: 'owner_center', type: 'int' })
  ownerCenter: number;

  @ApiPropertyOptional({
    description: 'Users groups excluded columns',
    nullable: true,
  })
  @Column({ name: 'users_grps_execluded_cols', type: 'text', nullable: true })
  usersGrpsExecludedCols: string | null;

  @ApiPropertyOptional({
    description: 'Default group by field',
    example: 'status',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'default_group_by_field', type: 'varchar', length: 255, nullable: true })
  defaultGroupByField: string | null;

  @ApiPropertyOptional({
    description: 'Send tables forms',
    nullable: true,
  })
  @Column({ name: 'send_tables_forms', type: 'text', nullable: true })
  sendTablesForms: string | null;

  @ApiPropertyOptional({
    description: 'Custom icons',
    nullable: true,
  })
  @Column({ name: 'custom_icons', type: 'text', nullable: true })
  customIcons: string | null;

  @ApiPropertyOptional({
    description: 'Main tree field',
    example: 'parent_id',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'main_tree_field', type: 'varchar', length: 255, nullable: true })
  mainTreeField: string | null;

  @ApiPropertyOptional({
    description: 'Additional tree fields',
    nullable: true,
  })
  @Column({ name: 'additional_tree_fields', type: 'text', nullable: true })
  additionalTreeFields: string | null;

  @ApiPropertyOptional({
    description: 'Users groups form excluded columns',
    nullable: true,
  })
  @Column({ name: 'users_grps_form_execluded_cols', type: 'text', nullable: true })
  usersGrpsFormExecludedCols: string | null;

  @ApiPropertyOptional({
    description: 'Index PHP code',
    nullable: true,
  })
  @Column({ name: 'index_php', type: 'text', nullable: true })
  indexPhp: string | null;

  @ApiPropertyOptional({
    description: 'Index JS code',
    nullable: true,
  })
  @Column({ name: 'index_js', type: 'text', nullable: true })
  indexJs: string | null;

  @ApiPropertyOptional({
    description: 'Form PHP code',
    nullable: true,
  })
  @Column({ name: 'form_php', type: 'text', nullable: true })
  formPhp: string | null;

  @ApiPropertyOptional({
    description: 'Form JS code',
    nullable: true,
  })
  @Column({ name: 'form_js', type: 'text', nullable: true })
  formJs: string | null;

  @ApiPropertyOptional({
    description: 'Pre trigger code',
    nullable: true,
  })
  @Column({ name: 'pre_trigger', type: 'text', nullable: true })
  preTrigger: string | null;

  @ApiProperty({
    description: 'Side menu trigger arrow flag',
    example: 1,
  })
  @Column({ name: 'side_menu_trigger_arrow', type: 'int' })
  sideMenuTriggerArrow: number;

  @ApiPropertyOptional({
    description: 'Pre create form title',
    example: 'Create New User',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'pre_create_form_title', type: 'varchar', length: 255, nullable: true })
  preCreateFormTitle: string | null;

  @ApiPropertyOptional({
    description: 'Notification send groups',
    nullable: true,
  })
  @Column({ name: 'notif_send_grps', type: 'text', nullable: true })
  notifSendGrps: string | null;

  @ApiPropertyOptional({
    description: 'Create form title',
    example: 'New User',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'create_form_title', type: 'varchar', length: 255, nullable: true })
  createFormTitle: string | null;

  @ApiProperty({
    description: 'Side tree opened flag',
    example: 1,
  })
  @Column({ name: 'side_tree_opened', type: 'int' })
  sideTreeOpened: number;

  @ApiPropertyOptional({
    description: 'Record conditions',
    nullable: true,
  })
  @Column({ name: 'record_conditions', type: 'text', nullable: true })
  recordConditions: string | null;

  @ApiPropertyOptional({
    description: 'Splitting fields',
    nullable: true,
  })
  @Column({ name: 'splitting_fields', type: 'text', nullable: true })
  splittingFields: string | null;

  @ApiPropertyOptional({
    description: 'Board applicable flag',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'board_applicable', type: 'int', nullable: true })
  boardApplicable: number | null;

  @ApiPropertyOptional({
    description: 'Cards table name',
    example: 'ag_cards',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'cards_table', type: 'varchar', length: 255, nullable: true })
  cardsTable: string | null;

  @ApiPropertyOptional({
    description: 'Card title field',
    example: 'title',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'card_title_field', type: 'varchar', length: 255, nullable: true })
  cardTitleField: string | null;

  @ApiPropertyOptional({
    description: 'Foreign field',
    example: 'board_id',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'foreign_field', type: 'varchar', length: 255, nullable: true })
  foreignField: string | null;

  @ApiPropertyOptional({
    description: 'Board list field',
    example: 'list_id',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'board_list_field', type: 'varchar', length: 255, nullable: true })
  boardListField: string | null;

  @ApiPropertyOptional({
    description: 'Priority field',
    example: 'priority',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'priority_field', type: 'varchar', length: 255, nullable: true })
  priorityField: string | null;

  @ApiPropertyOptional({
    description: 'Assignee field',
    example: 'assignee_id',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'assignee_field', type: 'varchar', length: 255, nullable: true })
  assigneeField: string | null;

  @ApiPropertyOptional({
    description: 'Card description field',
    example: 'description',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'card_desc_field', type: 'varchar', length: 255, nullable: true })
  cardDescField: string | null;

  @ApiPropertyOptional({
    description: 'Send reminder groups',
    nullable: true,
  })
  @Column({ name: 'send_reminder_grps', type: 'text', nullable: true })
  sendReminderGrps: string | null;

  @ApiPropertyOptional({
    description: 'Send reminder users IDs',
    nullable: true,
  })
  @Column({ name: 'send_reminder_users_ids', type: 'text', nullable: true })
  sendReminderUsersIds: string | null;

  @ApiProperty({
    description: 'Show file manager on update flag',
    example: 1,
  })
  @Column({ name: 'show_file_manager_on_update', type: 'int' })
  showFileManagerOnUpdate: number;

  // Fields from rules that aren't in attributeLabels but exist in database
  @ApiPropertyOptional({
    description: 'Modal fields table',
    example: 'users',
    maxLength: 100,
    nullable: true,
  })
  @Column({ name: 'modal_fields_table', type: 'varchar', length: 100, nullable: true })
  modalFieldsTable: string | null;

  @ApiPropertyOptional({
    description: 'Modal relation field',
    example: 'user_id',
    maxLength: 100,
    nullable: true,
  })
  @Column({ name: 'modal_relation_field', type: 'varchar', length: 100, nullable: true })
  modalRelationField: string | null;

  @ApiPropertyOptional({
    description: 'Modal fields',
    example: 'id,name,email',
    maxLength: 255,
    nullable: true,
  })
  @Column({ name: 'modal_fields', type: 'varchar', length: 255, nullable: true })
  modalFields: string | null;

  @ApiPropertyOptional({
    description: 'Show create button flag',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'show_create_btn', type: 'int', nullable: true })
  showCreateBtn: number | null;
}
