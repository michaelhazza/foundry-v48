import { Router } from 'express';
import * as canonicalSchemasService from '../services/canonicalSchemas.service';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/canonical-schemas
router.get('/', authenticate, async (req: any, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const isPublished = req.query.isPublished === 'true' ? true :
                        req.query.isPublished === 'false' ? false : undefined;
    const schemas = await canonicalSchemasService.listCanonicalSchemas(
      page,
      limit,
      isPublished
    );
    res.status(200).json(schemas);
  } catch (error) {
    next(error);
  }
});

// GET /api/canonical-schemas/:id
router.get('/:id', authenticate, async (req: any, res, next) => {
  try {
    const schema = await canonicalSchemasService.getCanonicalSchemaById(req.params.id);
    res.status(200).json(schema);
  } catch (error) {
    next(error);
  }
});

// POST /api/canonical-schemas
router.post('/', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    const schema = await canonicalSchemasService.createCanonicalSchema(req.body);
    res.status(201).json(schema);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/canonical-schemas/:id
router.patch('/:id', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    const schema = await canonicalSchemasService.updateCanonicalSchema(
      req.params.id,
      req.body
    );
    res.status(200).json(schema);
  } catch (error) {
    next(error);
  }
});

export default router;
