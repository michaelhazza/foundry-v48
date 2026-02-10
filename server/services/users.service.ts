import { db } from '../db';
import { users } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../lib/errors';
import crypto from 'crypto';

export async function listUsers(
  organisationId: string,
  page: number = 1,
  limit: number = 50
) {
  const offset = (page - 1) * limit;

  const usersList = await db.select()
    .from(users)
    .where(
      and(
        eq(users.organisationId, organisationId),
        isNull(users.deletedAt)
      )
    )
    .limit(limit)
    .offset(offset);

  // Remove password hashes from results
  return usersList.map(({ passwordHash, ...user }) => user);
}

export async function getUserById(organisationId: string, userId: string) {
  const [user] = await db.select()
    .from(users)
    .where(
      and(
        eq(users.id, userId),
        eq(users.organisationId, organisationId),
        isNull(users.deletedAt)
      )
    );

  if (!user) {
    throw new NotFoundError('user');
  }

  // Remove password hash from result
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateUser(
  organisationId: string,
  userId: string,
  updates: { name?: string; role?: 'admin' | 'member' }
) {
  if (!updates.name && !updates.role) {
    throw new ValidationError('No updates provided');
  }

  const [user] = await db.update(users)
    .set({
      ...updates,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(users.id, userId),
        eq(users.organisationId, organisationId),
        isNull(users.deletedAt)
      )
    )
    .returning();

  if (!user) {
    throw new NotFoundError('user');
  }

  // Remove password hash from result
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function deleteUser(organisationId: string, userId: string) {
  const now = new Date();

  const [user] = await db.update(users)
    .set({ deletedAt: now, updatedAt: now })
    .where(
      and(
        eq(users.id, userId),
        eq(users.organisationId, organisationId),
        isNull(users.deletedAt)
      )
    )
    .returning();

  if (!user) {
    throw new NotFoundError('user');
  }
}

export async function createInvite(
  organisationId: string,
  email: string,
  role: 'admin' | 'member'
) {
  // Generate invite token
  const inviteToken = crypto.randomBytes(32).toString('hex');
  const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Create placeholder user with invite token
  const [user] = await db.insert(users)
    .values({
      organisationId,
      email,
      passwordHash: '', // Will be set during registration
      name: '', // Will be set during registration
      role,
      inviteToken,
      inviteTokenExpiry
    })
    .returning();

  return {
    inviteToken,
    email: user.email
  };
}
