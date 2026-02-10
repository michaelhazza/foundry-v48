import { db } from '../db';
import { processingJobs, projects, datasets } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError, InvalidStateError, RecordLimitError } from '../lib/errors';

export async function createProcessingJob(
  organisationId: string,
  userId: string,
  projectId: string,
  jobConfig: {
    sourceIds: string[];
    triggeredBy?: 'manual' | 'scheduled';
  }
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

  // Create config snapshot
  const configSnapshot = {
    projectConfig: project.processingConfig,
    sourceIds: jobConfig.sourceIds,
    canonicalSchemaId: project.canonicalSchemaId,
    deidentificationRules: project.processingConfig?.deidentificationRules || []
  };

  // Create processing job
  const [job] = await db.insert(processingJobs)
    .values({
      projectId,
      triggeredBy: jobConfig.triggeredBy || 'manual',
      triggeredByUserId: userId,
      status: 'queued',
      configSnapshot,
      configSnapshotVersion: 1
    })
    .returning();

  return job;
}

export async function listProcessingJobs(
  organisationId: string,
  projectId?: string,
  page: number = 1,
  limit: number = 50,
  status?: 'queued' | 'processing' | 'completed' | 'failed'
) {
  const offset = (page - 1) * limit;

  const jobsList = await db.select({
    job: processingJobs,
    project: projects
  })
    .from(processingJobs)
    .innerJoin(projects, eq(processingJobs.projectId, projects.id))
    .where(
      and(
        eq(projects.organisationId, organisationId),
        isNull(processingJobs.deletedAt),
        isNull(projects.deletedAt),
        projectId ? eq(processingJobs.projectId, projectId) : undefined,
        status ? eq(processingJobs.status, status) : undefined
      )
    )
    .limit(limit)
    .offset(offset);

  return jobsList.map(({ job }) => job);
}

export async function getProcessingJobById(organisationId: string, jobId: string) {
  const [result] = await db.select({
    job: processingJobs,
    project: projects
  })
    .from(processingJobs)
    .innerJoin(projects, eq(processingJobs.projectId, projects.id))
    .where(
      and(
        eq(processingJobs.id, jobId),
        eq(projects.organisationId, organisationId),
        isNull(processingJobs.deletedAt),
        isNull(projects.deletedAt)
      )
    );

  if (!result) {
    throw new NotFoundError('processing job');
  }

  return result.job;
}

export async function retryProcessingJob(
  organisationId: string,
  userId: string,
  jobId: string
) {
  // Get original job
  const originalJob = await getProcessingJobById(organisationId, jobId);

  // Verify job is in failed state
  if (originalJob.status !== 'failed') {
    throw new InvalidStateError('Only failed jobs can be retried');
  }

  // Create new job with same configuration
  const [newJob] = await db.insert(processingJobs)
    .values({
      projectId: originalJob.projectId,
      triggeredBy: 'manual',
      triggeredByUserId: userId,
      status: 'queued',
      configSnapshot: originalJob.configSnapshot,
      configSnapshotVersion: originalJob.configSnapshotVersion
    })
    .returning();

  return newJob;
}
