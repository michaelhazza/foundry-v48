import { pgTable, uuid, text, timestamp, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';

export const userRoleEnum = pgEnum('user_role', ['admin', 'member']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').notNull().references(() => organisations.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull(),
  inviteToken: text('invite_token'),
  inviteTokenExpiry: timestamp('invite_token_expiry', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'date' })
}, (table) => ({
  emailActiveIdx: unique('idx_users_email_active')
    .on(table.email)
    .where(table.deletedAt.isNull()),
  orgDeletedIdx: index('idx_users_org_deleted').on(table.organisationId, table.deletedAt),
  inviteTokenIdx: index('idx_users_invite_token').on(table.inviteToken),
  deletedAtIdx: index('idx_users_deleted_at').on(table.deletedAt)
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = 'admin' | 'member';
