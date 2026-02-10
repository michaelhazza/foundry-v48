import { Router } from 'express';
import * as authService from '../services/auth.service';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, inviteToken } = req.body;
    const result = await authService.register(email, password, name, inviteToken);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/session
router.get('/session', authenticate, async (req: any, res, next) => {
  try {
    const user = await authService.getSession(req.user.userId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
