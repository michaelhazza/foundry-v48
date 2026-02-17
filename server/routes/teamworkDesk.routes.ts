import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as teamworkDeskService from '../services/teamworkDesk.service';
import * as sourcesService from '../services/sources.service';

const router = Router();

// POST /api/integrations/teamwork-desk/test-connection
// Validates the provided credentials against the Teamwork Desk API
router.post('/test-connection', authenticate, async (req: any, res, next) => {
  try {
    const { siteName, apiKey } = req.body;
    const result = await teamworkDeskService.testConnection(siteName, apiKey);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/integrations/teamwork-desk/sources
// Creates a new source backed by a Teamwork Desk connection.
// The API key is encrypted before being persisted.
router.post('/sources', authenticate, async (req: any, res, next) => {
  try {
    const { projectId, name, siteName, apiKey, dataType = 'tickets' } = req.body;

    // Verify credentials before creating the source
    await teamworkDeskService.testConnection(siteName, apiKey);

    const apiConnectionConfig = teamworkDeskService.buildConfig(siteName, apiKey, dataType);

    const source = await sourcesService.createSource(
      req.user.organisationId,
      projectId,
      {
        name,
        sourceType: 'api',
        apiConnectionConfig,
      }
    );

    res.status(201).json(source);
  } catch (error) {
    next(error);
  }
});

export default router;
