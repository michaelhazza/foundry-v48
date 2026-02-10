import { pgTable, uuid, text, integer, jsonb, boolean, timestamp, index, unique } from 'drizzle-orm/pg-core';

export const canonicalSchemas = pgTable('canonical_schemas', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  version: integer('version').notNull(),
  schemaDefinition: jsonb('schema_definition').notNull(),
  schemaDefinitionVersion: integer('schema_definition_version').notNull().default(1),
  description: text('description').notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow()
}, (table) => ({
  nameVersionIdx: unique('idx_canonical_schemas_name_version').on(table.name, table.version),
  publishedIdx: index('idx_canonical_schemas_published').on(table.isPublished)
}));

export type CanonicalSchema = typeof canonicalSchemas.$inferSelect;
export type NewCanonicalSchema = typeof canonicalSchemas.$inferInsert;
