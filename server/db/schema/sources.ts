import { pgTable, uuid, text, timestamp, pgEnum, jsonb, integer, bigint, index } from 'drizzle-orm/pg-core';
import { projects } from './projects';

export const sourceTypeEnum = pgEnum('source_type', ['file', 'api']);
export const sourceStatusEnum = pgEnum('source_status', ['connected', 'cached', 'expired', 'error']);

export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  name: text('name').notNull(),
  sourceType: sourceTypeEnum('source_type').notNull(),
  fileUploadPath: text('file_upload_path'),
  fileMimeType: text('file_mime_type'),
  fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }),
  apiConnectionConfig: jsonb('api_connection_config'),
  apiConnectionConfigVersion: integer('api_connection_config_version').default(1),
  status: sourceStatusEnum('status').notNull().default('connected'),
  cachedDataPath: text('cached_data_path'),
  cachedAt: timestamp('cached_at', { mode: 'date' }),
  cacheExpiryDate: timestamp('cache_expiry_date', { mode: 'date' }),
  recordCount: integer('record_count'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' })
}, (table) => ({
  projectIdx: index('idx_sources_project').on(table.projectId, table.deletedAt),
  statusIdx: index('idx_sources_status').on(table.status, table.deletedAt),
  cacheExpiryIdx: index('idx_sources_cache_expiry').on(table.cacheExpiryDate),
  deletedAtIdx: index('idx_sources_deleted_at').on(table.deletedAt)
}));

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type SourceType = 'file' | 'api';
export type SourceStatus = 'connected' | 'cached' | 'expired' | 'error';
