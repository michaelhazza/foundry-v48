import { Router } from 'express';
import * as organisationsService from '../services/organisations.service';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/organisations/me
router.get('/me', authenticate, async (req: any, res, next) => {
  try {
    const organisation = await organisationsService.getMyOrganisation(req.user.organisationId);
    res.status(200).json(organisation);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/organisations/me
router.patch('/me', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    const organisation = await organisationsService.updateMyOrganisation(
      req.user.organisationId,
      req.body
    );
    res.status(200).json(organisation);
  } catch (error) {
    next(error);
  }
});

export default router;
