import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Protected pages
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import OrganisationSettingsPage from './pages/OrganisationSettingsPage';
import UsersPage from './pages/UsersPage';

// Projects
import ProjectsPage from './pages/ProjectsPage';
import NewProjectPage from './pages/NewProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectSourcesPage from './pages/ProjectSourcesPage';
import ProjectProcessingJobsPage from './pages/ProjectProcessingJobsPage';
import ProjectDatasetsPage from './pages/ProjectDatasetsPage';

// Sources
import SourcesPage from './pages/SourcesPage';
import NewSourcePage from './pages/NewSourcePage';

// Processing Jobs
import ProcessingJobsPage from './pages/ProcessingJobsPage';
import ProcessingJobDetailPage from './pages/ProcessingJobDetailPage';

// Datasets
import DatasetsPage from './pages/DatasetsPage';
import DatasetDetailPage from './pages/DatasetDetailPage';

// Canonical Schemas
import CanonicalSchemasPage from './pages/CanonicalSchemasPage';
import CanonicalSchemaDetailPage from './pages/CanonicalSchemaDetailPage';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
      <Route path="/organisation/settings" element={<RequireAuth><OrganisationSettingsPage /></RequireAuth>} />
      <Route path="/admin/users" element={<RequireAuth><UsersPage /></RequireAuth>} />

      {/* Projects */}
      <Route path="/projects" element={<RequireAuth><ProjectsPage /></RequireAuth>} />
      <Route path="/projects/new" element={<RequireAuth><NewProjectPage /></RequireAuth>} />
      <Route path="/projects/:projectId" element={<RequireAuth><ProjectDetailPage /></RequireAuth>} />
      <Route path="/projects/:projectId/sources" element={<RequireAuth><ProjectSourcesPage /></RequireAuth>} />
      <Route path="/projects/:projectId/processing-jobs" element={<RequireAuth><ProjectProcessingJobsPage /></RequireAuth>} />
      <Route path="/projects/:projectId/datasets" element={<RequireAuth><ProjectDatasetsPage /></RequireAuth>} />

      {/* Sources */}
      <Route path="/sources" element={<RequireAuth><SourcesPage /></RequireAuth>} />
      <Route path="/sources/new" element={<RequireAuth><NewSourcePage /></RequireAuth>} />

      {/* Processing Jobs */}
      <Route path="/processing-jobs" element={<RequireAuth><ProcessingJobsPage /></RequireAuth>} />
      <Route path="/processing-jobs/:id" element={<RequireAuth><ProcessingJobDetailPage /></RequireAuth>} />

      {/* Datasets */}
      <Route path="/datasets" element={<RequireAuth><DatasetsPage /></RequireAuth>} />
      <Route path="/datasets/:id" element={<RequireAuth><DatasetDetailPage /></RequireAuth>} />

      {/* Canonical Schemas */}
      <Route path="/canonical-schemas" element={<RequireAuth><CanonicalSchemasPage /></RequireAuth>} />
      <Route path="/canonical-schemas/:id" element={<RequireAuth><CanonicalSchemaDetailPage /></RequireAuth>} />
    </Routes>
  );
}

export default App;
