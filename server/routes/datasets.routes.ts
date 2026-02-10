import { Router } from 'express';
import * as datasetsService from '../services/datasets.service';
import { authenticate } from '../middleware/auth';
import fs from 'fs';

const router = Router();

// GET /api/datasets
router.get('/', authenticate, async (req: any, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const projectId = req.query.projectId as string | undefined;
    const outputFormat = req.query.outputFormat as any;
    const datasets = await datasetsService.listDatasets(
      req.user.organisationId,
      projectId,
      page,
      limit,
      outputFormat
    );
    res.status(200).json(datasets);
  } catch (error) {
    next(error);
  }
});

// GET /api/datasets/:id
router.get('/:id', authenticate, async (req: any, res, next) => {
  try {
    const dataset = await datasetsService.getDatasetById(
      req.user.organisationId,
      req.params.id
    );
    res.status(200).json(dataset);
  } catch (error) {
    next(error);
  }
});

// GET /api/datasets/:id/download
router.get('/:id/download', authenticate, async (req: any, res, next) => {
  try {
    const { filePath, fileName, mimeType } = await datasetsService.downloadDataset(
      req.user.organisationId,
      req.params.id
    );

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/datasets/:id
router.delete('/:id', authenticate, async (req: any, res, next) => {
  try {
    await datasetsService.deleteDataset(req.user.organisationId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
