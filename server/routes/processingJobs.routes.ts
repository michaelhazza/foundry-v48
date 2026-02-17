import { Router } from 'express';
import * as processingJobsService from '../services/processingJobs.service';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/processing-jobs
router.post('/', authenticate, async (req: any, res, next) => {
  try {
    const job = await processingJobsService.createProcessingJob(
      req.user.organisationId,
      req.user.userId,
      req.body.projectId,
      req.body
    );
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

// GET /api/processing-jobs
router.get('/', authenticate, async (req: any, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const projectId = req.query.projectId as string | undefined;
    const status = req.query.status as 'queued' | 'processing' | 'completed' | 'failed' | undefined;
    const jobs = await processingJobsService.listProcessingJobs(
      req.user.organisationId,
      projectId,
      page,
      limit,
      status
    );
    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
});

// GET /api/processing-jobs/:id
router.get('/:id', authenticate, async (req: any, res, next) => {
  try {
    const job = await processingJobsService.getProcessingJobById(
      req.user.organisationId,
      req.params.id
    );
    res.status(200).json(job);
  } catch (error) {
    next(error);
  }
});

// POST /api/processing-jobs/:id/retry
router.post('/:id/retry', authenticate, async (req: any, res, next) => {
  try {
    const job = await processingJobsService.retryProcessingJob(
      req.user.organisationId,
      req.user.userId,
      req.params.id
    );
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

export default router;
