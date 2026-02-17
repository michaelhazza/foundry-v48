import { pgTable, uuid, text, timestamp, pgEnum, jsonb, integer, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';
import { users } from './users';
import { canonicalSchemas } from './canonicalSchemas';
import { sql } from 'drizzle-orm';

export const projectStatusEnum = pgEnum('project_status', ['draft', 'active', 'archived']);

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').notNull().references(() => organisations.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  createdByUserId: uuid('created_by_user_id').references(() => users.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  canonicalSchemaId: uuid('canonical_schema_id').notNull().references(() => canonicalSchemas.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  status: projectStatusEnum('status').notNull().default('draft'),
  processingConfig: jsonb('processing_config'),
  processingConfigVersion: integer('processing_config_version').default(1),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' })
}, (table) => ({
  orgNameActiveIdx: uniqueIndex('idx_projects_org_name_active')
    .on(table.organisationId, table.name)
    .where(sql`${table.deletedAt} IS NULL`),
  orgDeletedIdx: index('idx_projects_org_deleted').on(table.organisationId, table.deletedAt),
  statusIdx: index('idx_projects_status').on(table.status, table.deletedAt),
  createdByIdx: index('idx_projects_created_by').on(table.createdByUserId),
  canonicalSchemaIdx: index('idx_projects_canonical_schema').on(table.canonicalSchemaId),
  deletedAtIdx: index('idx_projects_deleted_at').on(table.deletedAt)
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectStatus = 'draft' | 'active' | 'archived';
