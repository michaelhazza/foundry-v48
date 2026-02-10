import { pgTable, uuid, timestamp, pgEnum, jsonb, integer, text, index } from 'drizzle-orm/pg-core';
import { projects } from './projects';
import { users } from './users';

export const jobTriggerEnum = pgEnum('job_trigger', ['manual', 'scheduled']);
export const processingJobStatusEnum = pgEnum('processing_job_status', ['queued', 'processing', 'completed', 'failed']);

export const processingJobs = pgTable('processing_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  triggeredBy: jobTriggerEnum('triggered_by').notNull(),
  triggeredByUserId: uuid('triggered_by_user_id').references(() => users.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  status: processingJobStatusEnum('status').notNull().default('queued'),
  configSnapshot: jsonb('config_snapshot').notNull(),
  configSnapshotVersion: integer('config_snapshot_version').notNull().default(1),
  inputRecordCount: integer('input_record_count'),
  outputRecordCount: integer('output_record_count'),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { mode: 'date' }),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' })
}, (table) => ({
  projectIdx: index('idx_processing_jobs_project').on(table.projectId, table.deletedAt),
  statusIdx: index('idx_processing_jobs_status').on(table.status, table.deletedAt),
  triggeredByIdx: index('idx_processing_jobs_triggered_by').on(table.triggeredByUserId),
  createdAtIdx: index('idx_processing_jobs_created_at').on(table.createdAt),
  deletedAtIdx: index('idx_processing_jobs_deleted_at').on(table.deletedAt)
}));

export type ProcessingJob = typeof processingJobs.$inferSelect;
export type NewProcessingJob = typeof processingJobs.$inferInsert;
export type JobTrigger = 'manual' | 'scheduled';
export type ProcessingJobStatus = 'queued' | 'processing' | 'completed' | 'failed';
