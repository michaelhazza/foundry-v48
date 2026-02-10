import { pgTable, uuid, text, timestamp, index, unique } from 'drizzle-orm/pg-core';

export const organisations = pgTable('organisations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' })
}, (table) => ({
  slugActiveIdx: unique('idx_orgs_slug_active')
    .on(table.slug)
    .where(table.deletedAt.isNull()),
  deletedAtIdx: index('idx_orgs_deleted_at').on(table.deletedAt)
}));

export type Organisation = typeof organisations.$inferSelect;
export type NewOrganisation = typeof organisations.$inferInsert;
