import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users, organisations } from '../db/schema';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { generateAccessToken } from '../lib/auth';
import { AuthenticationError, InviteTokenError, ValidationError } from '../lib/errors';

export async function register(
  email: string,
  password: string,
  name: string,
  inviteToken: string
) {
  // Validate invite token
  const [invitedUser] = await db.select()
    .from(users)
    .where(
      and(
        eq(users.inviteToken, inviteToken),
        gt(users.inviteTokenExpiry, new Date()),
        isNull(users.deletedAt)
      )
    );

  if (!invitedUser) {
    throw new InviteTokenError('Invalid or expired invite token');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Update user with registration details
  const [user] = await db.update(users)
    .set({
      email,
      passwordHash,
      name,
      inviteToken: null,
      inviteTokenExpiry: null,
      updatedAt: new Date()
    })
    .where(eq(users.id, invitedUser.id))
    .returning();

  // Generate token
  const token = generateAccessToken({
    userId: user.id,
    organisationId: user.organisationId,
    role: user.role
  });

  // Return user without password
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token
  };
}

export async function login(email: string, password: string) {
  // Find user by email
  const [user] = await db.select()
    .from(users)
    .where(
      and(
        eq(users.email, email),
        isNull(users.deletedAt)
      )
    );

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Generate token
  const token = generateAccessToken({
    userId: user.id,
    organisationId: user.organisationId,
    role: user.role
  });

  // Return user without password
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token
  };
}

export async function getSession(userId: string) {
  const [user] = await db.select()
    .from(users)
    .where(
      and(
        eq(users.id, userId),
        isNull(users.deletedAt)
      )
    );

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  // Return user without password
  const { passwordHash: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
}
