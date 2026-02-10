import { pgTable, uuid, text, timestamp, pgEnum, jsonb, integer, bigint, index } from 'drizzle-orm/pg-core';
import { projects } from './projects';
import { processingJobs } from './processingJobs';

export const outputFormatEnum = pgEnum('output_format', ['conversationalJsonl', 'qaJson', 'structuredJson']);

export const datasets = pgTable('datasets', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  processingJobId: uuid('processing_job_id').notNull().references(() => processingJobs.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  name: text('name').notNull(),
  outputFormat: outputFormatEnum('output_format').notNull(),
  outputStoragePath: text('output_storage_path').notNull(),
  recordCount: integer('record_count').notNull(),
  fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }).notNull(),
  lineageData: jsonb('lineage_data').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' })
}, (table) => ({
  projectIdx: index('idx_datasets_project').on(table.projectId, table.deletedAt),
  processingJobIdx: index('idx_datasets_processing_job').on(table.processingJobId),
  outputFormatIdx: index('idx_datasets_output_format').on(table.outputFormat, table.deletedAt),
  createdAtIdx: index('idx_datasets_created_at').on(table.createdAt),
  deletedAtIdx: index('idx_datasets_deleted_at').on(table.deletedAt)
}));

export type Dataset = typeof datasets.$inferSelect;
export type NewDataset = typeof datasets.$inferInsert;
export type OutputFormat = 'conversationalJsonl' | 'qaJson' | 'structuredJson';
