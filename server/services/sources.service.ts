import { db } from '../db';
import { sources, projects } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../lib/errors';

export async function createSource(
  organisationId: string,
  projectId: string,
  sourceData: {
    name: string;
    sourceType: 'file' | 'api';
    apiConnectionConfig?: any;
  },
  file?: Express.Multer.File
) {
  // Verify project exists and belongs to organisation
  const [project] = await db.select()
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.organisationId, organisationId),
        isNull(projects.deletedAt)
      )
    );

  if (!project) {
    throw new NotFoundError('project');
  }

  // Prepare source data based on type
  const sourceValues: any = {
    projectId,
    name: sourceData.name,
    sourceType: sourceData.sourceType,
    status: 'connected'
  };

  if (sourceData.sourceType === 'file' && file) {
    sourceValues.fileUploadPath = file.path;
    sourceValues.fileMimeType = file.mimetype;
    sourceValues.fileSizeBytes = file.size;
  } else if (sourceData.sourceType === 'api' && sourceData.apiConnectionConfig) {
    sourceValues.apiConnectionConfig = sourceData.apiConnectionConfig;
    sourceValues.apiConnectionConfigVersion = 1;
  }

  const [source] = await db.insert(sources)
    .values(sourceValues)
    .returning();

  return source;
}

export async function listSources(
  organisationId: string,
  projectId?: string,
  page: number = 1,
  limit: number = 50,
  status?: 'connected' | 'cached' | 'expired' | 'error'
) {
  const offset = (page - 1) * limit;

  // Build query to filter by organisation through projects
  const sourcesList = await db.select({
    source: sources,
    project: projects
  })
    .from(sources)
    .innerJoin(projects, eq(sources.projectId, projects.id))
    .where(
      and(
        eq(projects.organisationId, organisationId),
        isNull(sources.deletedAt),
        isNull(projects.deletedAt),
        projectId ? eq(sources.projectId, projectId) : undefined,
        status ? eq(sources.status, status) : undefined
      )
    )
    .limit(limit)
    .offset(offset);

  return sourcesList.map(({ source }) => source);
}

export async function getSourceById(organisationId: string, sourceId: string) {
  const [result] = await db.select({
    source: sources,
    project: projects
  })
    .from(sources)
    .innerJoin(projects, eq(sources.projectId, projects.id))
    .where(
      and(
        eq(sources.id, sourceId),
        eq(projects.organisationId, organisationId),
        isNull(sources.deletedAt),
        isNull(projects.deletedAt)
      )
    );

  if (!result) {
    throw new NotFoundError('source');
  }

  return result.source;
}

export async function updateSource(
  organisationId: string,
  sourceId: string,
  updates: {
    name?: string;
    apiConnectionConfig?: any;
    status?: 'connected' | 'cached' | 'expired' | 'error';
    errorMessage?: string;
  }
) {
  if (!Object.keys(updates).length) {
    throw new ValidationError('No updates provided');
  }

  // Verify source exists and belongs to organisation
  await getSourceById(organisationId, sourceId);

  // If API config is updated, increment version
  const setValues: any = {
    ...updates,
    updatedAt: new Date()
  };

  if (updates.apiConnectionConfig !== undefined) {
    const [current] = await db.select()
      .from(sources)
      .where(eq(sources.id, sourceId));

    if (current) {
      setValues.apiConnectionConfigVersion = (current.apiConnectionConfigVersion || 0) + 1;
    }
  }

  const [source] = await db.update(sources)
    .set(setValues)
    .where(
      and(
        eq(sources.id, sourceId),
        isNull(sources.deletedAt)
      )
    )
    .returning();

  if (!source) {
    throw new NotFoundError('source');
  }

  return source;
}

export async function deleteSource(organisationId: string, sourceId: string) {
  // Verify source exists and belongs to organisation
  await getSourceById(organisationId, sourceId);

  const now = new Date();

  const [source] = await db.update(sources)
    .set({ deletedAt: now, updatedAt: now })
    .where(
      and(
        eq(sources.id, sourceId),
        isNull(sources.deletedAt)
      )
    )
    .returning();

  if (!source) {
    throw new NotFoundError('source');
  }
}
