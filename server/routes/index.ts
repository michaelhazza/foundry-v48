import { Router } from 'express';
import authRoutes from './auth.routes';
import organisationsRoutes from './organisations.routes';
import usersRoutes from './users.routes';
import projectsRoutes from './projects.routes';
import sourcesRoutes from './sources.routes';
import processingJobsRoutes from './processingJobs.routes';
import datasetsRoutes from './datasets.routes';
import canonicalSchemasRoutes from './canonicalSchemas.routes';
import healthRoutes from './health.routes';
import teamworkDeskRoutes from './teamworkDesk.routes';

const router = Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/organisations', organisationsRoutes);
router.use('/users', usersRoutes);
router.use('/projects', projectsRoutes);
router.use('/sources', sourcesRoutes);
router.use('/processing-jobs', processingJobsRoutes);
router.use('/datasets', datasetsRoutes);
router.use('/canonical-schemas', canonicalSchemasRoutes);
router.use('/integrations/teamwork-desk', teamworkDeskRoutes);
router.use('/', healthRoutes);

export default router;
