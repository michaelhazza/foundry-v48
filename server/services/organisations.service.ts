import { db } from '../db';
import { organisations, users, projects } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../lib/errors';

export async function getMyOrganisation(organisationId: string) {
  const [organisation] = await db.select()
    .from(organisations)
    .where(
      and(
        eq(organisations.id, organisationId),
        isNull(organisations.deletedAt)
      )
    );

  if (!organisation) {
    throw new NotFoundError('organisation');
  }

  return organisation;
}

export async function updateMyOrganisation(
  organisationId: string,
  updates: { name?: string; slug?: string }
) {
  if (!updates.name && !updates.slug) {
    throw new ValidationError('No updates provided');
  }

  const [organisation] = await db.update(organisations)
    .set({
      ...updates,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(organisations.id, organisationId),
        isNull(organisations.deletedAt)
      )
    )
    .returning();

  if (!organisation) {
    throw new NotFoundError('organisation');
  }

  return organisation;
}

export async function softDeleteOrganisation(organisationId: string) {
  const now = new Date();

  // Cascade: soft-delete all users in organisation
  await db.update(users)
    .set({ deletedAt: now, updatedAt: now })
    .where(
      and(
        eq(users.organisationId, organisationId),
        isNull(users.deletedAt)
      )
    );

  // Cascade: soft-delete all projects in organisation
  await db.update(projects)
    .set({ deletedAt: now, updatedAt: now })
    .where(
      and(
        eq(projects.organisationId, organisationId),
        isNull(projects.deletedAt)
      )
    );

  // Soft-delete organisation itself
  const [organisation] = await db.update(organisations)
    .set({ deletedAt: now, updatedAt: now })
    .where(
      and(
        eq(organisations.id, organisationId),
        isNull(organisations.deletedAt)
      )
    )
    .returning();

  if (!organisation) {
    throw new NotFoundError('organisation');
  }

  return organisation;
}
