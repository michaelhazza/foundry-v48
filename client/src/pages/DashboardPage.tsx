import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';

export default function DashboardPage() {
  const { data: user } = useQuery({
    queryKey: ['session'],
    queryFn: () => api.get('/auth/session')
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', { limit: 5 }],
    queryFn: () => api.get('/projects?limit=5')
  });

  const { data: datasets = [] } = useQuery({
    queryKey: ['datasets', { limit: 5 }],
    queryFn: () => api.get('/datasets?limit=5')
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['processing-jobs', { status: 'processing,queued', limit: 10 }],
    queryFn: () => api.get('/processing-jobs?status=processing,queued&limit=10')
  });

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome back, {(user as any)?.name}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Recent Projects */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Projects
              </h3>
              <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
            <div className="mt-4">
              {(projects as any[]).length === 0 ? (
                <p className="text-sm text-gray-500">No projects yet</p>
              ) : (
                <ul className="space-y-2">
                  {(projects as any[]).slice(0, 5).map((project: any) => (
                    <li key={project.id}>
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        {project.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Recent Datasets */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Datasets
              </h3>
              <Link to="/datasets" className="text-sm text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
            <div className="mt-4">
              {(datasets as any[]).length === 0 ? (
                <p className="text-sm text-gray-500">No datasets yet</p>
              ) : (
                <ul className="space-y-2">
                  {(datasets as any[]).slice(0, 5).map((dataset: any) => (
                    <li key={dataset.id}>
                      <Link
                        to={`/datasets/${dataset.id}`}
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        {dataset.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Processing Status */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Active Jobs
              </h3>
              <Link to="/processing-jobs" className="text-sm text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
            <div className="mt-4">
              {(jobs as any[]).length === 0 ? (
                <p className="text-sm text-gray-500">No active jobs</p>
              ) : (
                <p className="text-2xl font-semibold text-gray-900">
                  {(jobs as any[]).length} running
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
