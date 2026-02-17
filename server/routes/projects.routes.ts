import { Router } from 'express';
import * as projectsService from '../services/projects.service';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/projects
router.post('/', authenticate, async (req: any, res, next) => {
  try {
    const project = await projectsService.createProject(
      req.user.organisationId,
      req.user.userId,
      req.body
    );
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects
router.get('/', authenticate, async (req: any, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const status = req.query.status as 'draft' | 'active' | 'archived' | undefined;
    const projects = await projectsService.listProjects(
      req.user.organisationId,
      page,
      limit,
      status
    );
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:id
router.get('/:id', authenticate, async (req: any, res, next) => {
  try {
    const project = await projectsService.getProjectById(
      req.user.organisationId,
      req.params.id
    );
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/projects/:id
router.patch('/:id', authenticate, async (req: any, res, next) => {
  try {
    const project = await projectsService.updateProject(
      req.user.organisationId,
      req.params.id,
      req.body
    );
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:id
router.delete('/:id', authenticate, async (req: any, res, next) => {
  try {
    await projectsService.deleteProject(req.user.organisationId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:projectId/sources
router.get('/:projectId/sources', authenticate, async (req: any, res, next) => {
  try {
    const sources = await projectsService.getProjectSources(
      req.user.organisationId,
      req.params.projectId
    );
    res.status(200).json(sources);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:projectId/processing-jobs
router.get('/:projectId/processing-jobs', authenticate, async (req: any, res, next) => {
  try {
    const jobs = await projectsService.getProjectProcessingJobs(
      req.user.organisationId,
      req.params.projectId
    );
    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:projectId/datasets
router.get('/:projectId/datasets', authenticate, async (req: any, res, next) => {
  try {
    const datasets = await projectsService.getProjectDatasets(
      req.user.organisationId,
      req.params.projectId
    );
    res.status(200).json(datasets);
  } catch (error) {
    next(error);
  }
});

export default router;
