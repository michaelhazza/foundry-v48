import { Router } from 'express';
import * as sourcesService from '../services/sources.service';
import { authenticate } from '../middleware/auth';
import { uploadFile } from '../middleware/upload';

const router = Router();

// POST /api/sources
router.post('/', authenticate, uploadFile.single('file'), async (req: any, res, next) => {
  try {
    const source = await sourcesService.createSource(
      req.user.organisationId,
      req.body.projectId,
      req.body,
      req.file
    );
    res.status(201).json(source);
  } catch (error) {
    next(error);
  }
});

// GET /api/sources
router.get('/', authenticate, async (req: any, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const projectId = req.query.projectId as string | undefined;
    const status = req.query.status as any;
    const sources = await sourcesService.listSources(
      req.user.organisationId,
      projectId,
      page,
      limit,
      status
    );
    res.status(200).json(sources);
  } catch (error) {
    next(error);
  }
});

// GET /api/sources/:id
router.get('/:id', authenticate, async (req: any, res, next) => {
  try {
    const source = await sourcesService.getSourceById(
      req.user.organisationId,
      req.params.id
    );
    res.status(200).json(source);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/sources/:id
router.patch('/:id', authenticate, async (req: any, res, next) => {
  try {
    const source = await sourcesService.updateSource(
      req.user.organisationId,
      req.params.id,
      req.body
    );
    res.status(200).json(source);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/sources/:id
router.delete('/:id', authenticate, async (req: any, res, next) => {
  try {
    await sourcesService.deleteSource(req.user.organisationId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
