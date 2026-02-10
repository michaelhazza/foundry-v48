import { Router } from 'express';
import * as usersService from '../services/users.service';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// POST /api/users/invite
router.post('/invite', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    const { email, role } = req.body;
    const result = await usersService.createInvite(req.user.organisationId, email, role);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/users
router.get('/', authenticate, async (req: any, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const users = await usersService.listUsers(req.user.organisationId, page, limit);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id
router.get('/:id', authenticate, async (req: any, res, next) => {
  try {
    const user = await usersService.getUserById(req.user.organisationId, req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/:id
router.patch('/:id', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    const user = await usersService.updateUser(
      req.user.organisationId,
      req.params.id,
      req.body
    );
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, requireAdmin, async (req: any, res, next) => {
  try {
    await usersService.deleteUser(req.user.organisationId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
