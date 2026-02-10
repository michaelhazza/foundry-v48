import { db } from '../db';
import { projects, sources, processingJobs, datasets } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../lib/errors';

export async function createProject(
  organisationId: string,
  userId: string,
  projectData: {
    name: string;
    description?: string;
    canonicalSchemaId: string;
    processingConfig?: any;
  }
) {
  const [project] = await db.insert(projects)
    .values({
      organisationId,
      createdByUserId: userId,
      name: projectData.name,
      description: projectData.description,
      canonicalSchemaId: projectData.canonicalSchemaId,
      processingConfig: projectData.processingConfig,
      processingConfigVersion: projectData.processingConfig ? 1 : null,
      status: 'draft'
    })
    .returning();

  return project;
}

export async function listProjects(
  organisationId: string,
  page: number = 1,
  limit: number = 50,
  status?: 'draft' | 'active' | 'archived'
) {
  const offset = (page - 1) * limit;

  let query = db.select()
    .from(projects)
    .where(
      and(
        eq(projects.organisationId, organisationId),
        isNull(projects.deletedAt),
        status ? eq(projects.status, status) : undefined
      )
    )
    .limit(limit)
    .offset(offset);

  return await query;
}

export async function getProjectById(organisationId: string, projectId: string) {
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

  return project;
}

export async function updateProject(
  organisationId: string,
  projectId: string,
  updates: {
    name?: string;
    description?: string;
    status?: 'draft' | 'active' | 'archived';
    processingConfig?: any;
  }
) {
  if (!Object.keys(updates).length) {
    throw new ValidationError('No updates provided');
  }

  // If processing config is updated, increment version
  const setValues: any = {
    ...updates,
    updatedAt: new Date()
  };

  if (updates.processingConfig !== undefined) {
    // Get current version
    const [current] = await db.select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (current) {
      setValues.processingConfigVersion = (current.processingConfigVersion || 0) + 1;
    }
  }

  const [project] = await db.update(projects)
    .set(setValues)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.organisationId, organisationId),
        isNull(projects.deletedAt)
      )
    )
    .returning();

  if (!project) {
    throw new NotFoundError('project');
  }

  return project;
}

export async function deleteProject(organisationId: string, projectId: string) {
  const now = new Date();

  // Soft delete the project
  const [project] = await db.update(projects)
    .set({ deletedAt: now, updatedAt: now })
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.organisationId, organisationId),
        isNull(projects.deletedAt)
      )
    )
    .returning();

  if (!project) {
    throw new NotFoundError('project');
  }

  // Cascade soft delete to sources
  await db.update(sources)
    .set({ deletedAt: now, updatedAt: now })
    .where(
      and(
        eq(sources.projectId, projectId),
        isNull(sources.deletedAt)
      )
    );

  // Cascade soft delete to processing jobs
  await db.update(processingJobs)
    .set({ deletedAt: now, updatedAt: now })
    .where(
      and(
        eq(processingJobs.projectId, projectId),
        isNull(processingJobs.deletedAt)
      )
    );

  // Cascade soft delete to datasets
  await db.update(datasets)
    .set({ deletedAt: now, updatedAt: now })
    .where(
      and(
        eq(datasets.projectId, projectId),
        isNull(datasets.deletedAt)
      )
    );
}

export async function getProjectSources(organisationId: string, projectId: string) {
  // Verify project exists and belongs to organisation
  await getProjectById(organisationId, projectId);

  const projectSources = await db.select()
    .from(sources)
    .where(
      and(
        eq(sources.projectId, projectId),
        isNull(sources.deletedAt)
      )
    );

  return projectSources;
}

export async function getProjectProcessingJobs(organisationId: string, projectId: string) {
  // Verify project exists and belongs to organisation
  await getProjectById(organisationId, projectId);

  const jobs = await db.select()
    .from(processingJobs)
    .where(
      and(
        eq(processingJobs.projectId, projectId),
        isNull(processingJobs.deletedAt)
      )
    );

  return jobs;
}

export async function getProjectDatasets(organisationId: string, projectId: string) {
  // Verify project exists and belongs to organisation
  await getProjectById(organisationId, projectId);

  const projectDatasets = await db.select()
    .from(datasets)
    .where(
      and(
        eq(datasets.projectId, projectId),
        isNull(datasets.deletedAt)
      )
    );

  return projectDatasets;
}
