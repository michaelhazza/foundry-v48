import { db } from '../db';
import { canonicalSchemas } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../lib/errors';

export async function listCanonicalSchemas(
  page: number = 1,
  limit: number = 50,
  isPublished?: boolean
) {
  const offset = (page - 1) * limit;

  const schemas = await db.select()
    .from(canonicalSchemas)
    .where(
      isPublished !== undefined ? eq(canonicalSchemas.isPublished, isPublished) : undefined
    )
    .limit(limit)
    .offset(offset);

  return schemas;
}

export async function getCanonicalSchemaById(schemaId: string) {
  const [schema] = await db.select()
    .from(canonicalSchemas)
    .where(eq(canonicalSchemas.id, schemaId));

  if (!schema) {
    throw new NotFoundError('canonical schema');
  }

  return schema;
}

export async function createCanonicalSchema(schemaData: {
  name: string;
  version: number;
  schemaDefinition: any;
  description: string;
  isPublished?: boolean;
}) {
  const [schema] = await db.insert(canonicalSchemas)
    .values({
      name: schemaData.name,
      version: schemaData.version,
      schemaDefinition: schemaData.schemaDefinition,
      schemaDefinitionVersion: 1,
      description: schemaData.description,
      isPublished: schemaData.isPublished || false
    })
    .returning();

  return schema;
}

export async function updateCanonicalSchema(
  schemaId: string,
  updates: {
    description?: string;
    schemaDefinition?: any;
    isPublished?: boolean;
  }
) {
  if (!Object.keys(updates).length) {
    throw new ValidationError('No updates provided');
  }

  // If schema definition is updated, increment version
  const setValues: any = {
    ...updates,
    updatedAt: new Date()
  };

  if (updates.schemaDefinition !== undefined) {
    const [current] = await db.select()
      .from(canonicalSchemas)
      .where(eq(canonicalSchemas.id, schemaId));

    if (current) {
      setValues.schemaDefinitionVersion = current.schemaDefinitionVersion + 1;
    }
  }

  const [schema] = await db.update(canonicalSchemas)
    .set(setValues)
    .where(eq(canonicalSchemas.id, schemaId))
    .returning();

  if (!schema) {
    throw new NotFoundError('canonical schema');
  }

  return schema;
}
