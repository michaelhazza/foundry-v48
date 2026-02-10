import { db } from '../db';
import { datasets, projects } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError } from '../lib/errors';
import fs from 'fs';

export async function listDatasets(
  organisationId: string,
  projectId?: string,
  page: number = 1,
  limit: number = 50,
  outputFormat?: 'conversationalJsonl' | 'qaJson' | 'structuredJson'
) {
  const offset = (page - 1) * limit;

  const datasetsList = await db.select({
    dataset: datasets,
    project: projects
  })
    .from(datasets)
    .innerJoin(projects, eq(datasets.projectId, projects.id))
    .where(
      and(
        eq(projects.organisationId, organisationId),
        isNull(datasets.deletedAt),
        isNull(projects.deletedAt),
        projectId ? eq(datasets.projectId, projectId) : undefined,
        outputFormat ? eq(datasets.outputFormat, outputFormat) : undefined
      )
    )
    .limit(limit)
    .offset(offset);

  return datasetsList.map(({ dataset }) => dataset);
}

export async function getDatasetById(organisationId: string, datasetId: string) {
  const [result] = await db.select({
    dataset: datasets,
    project: projects
  })
    .from(datasets)
    .innerJoin(projects, eq(datasets.projectId, projects.id))
    .where(
      and(
        eq(datasets.id, datasetId),
        eq(projects.organisationId, organisationId),
        isNull(datasets.deletedAt),
        isNull(projects.deletedAt)
      )
    );

  if (!result) {
    throw new NotFoundError('dataset');
  }

  return result.dataset;
}

export async function downloadDataset(organisationId: string, datasetId: string) {
  const dataset = await getDatasetById(organisationId, datasetId);

  // Check if file exists
  if (!fs.existsSync(dataset.outputStoragePath)) {
    throw new NotFoundError('dataset file');
  }

  return {
    filePath: dataset.outputStoragePath,
    fileName: dataset.name,
    mimeType: dataset.outputFormat === 'conversationalJsonl' ? 'application/x-jsonlines' : 'application/json'
  };
}

export async function deleteDataset(organisationId: string, datasetId: string) {
  // Verify dataset exists and belongs to organisation
  await getDatasetById(organisationId, datasetId);

  const now = new Date();

  const [dataset] = await db.update(datasets)
    .set({ deletedAt: now, updatedAt: now })
    .where(
      and(
        eq(datasets.id, datasetId),
        isNull(datasets.deletedAt)
      )
    )
    .returning();

  if (!dataset) {
    throw new NotFoundError('dataset');
  }
}
