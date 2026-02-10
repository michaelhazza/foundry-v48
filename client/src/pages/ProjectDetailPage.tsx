import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'processing' | 'datasets'>('overview');

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`)
  });

  const { data: sources = [] } = useQuery({
    queryKey: ['project-sources', projectId],
    queryFn: () => api.get(`/projects/${projectId}/sources`),
    enabled: activeTab === 'sources'
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['project-jobs', projectId],
    queryFn: () => api.get(`/projects/${projectId}/processing-jobs`),
    enabled: activeTab === 'processing'
  });

  const { data: datasets = [] } = useQuery({
    queryKey: ['project-datasets', projectId],
    queryFn: () => api.get(`/projects/${projectId}/datasets`),
    enabled: activeTab === 'datasets'
  });

  if (isLoading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  const projectData = project as any;

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">{projectData?.name}</h1>
        <p className="mt-2 text-sm text-gray-500">{projectData?.description}</p>
      </div>

      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'sources', 'processing', 'datasets'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">{projectData?.status}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(projectData?.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-4">
              <Link
                to={`/projects/${projectId}/sources`}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Manage Sources
              </Link>
              {(sources as any[]).length === 0 ? (
                <p className="text-sm text-gray-500">No sources configured</p>
              ) : (
                <ul className="bg-white shadow sm:rounded-lg divide-y">
                  {(sources as any[]).map((source: any) => (
                    <li key={source.id} className="px-4 py-4">
                      <p className="text-sm font-medium">{source.name}</p>
                      <p className="text-xs text-gray-500">Type: {source.sourceType}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'processing' && (
            <div>
              {(jobs as any[]).length === 0 ? (
                <p className="text-sm text-gray-500">No processing jobs yet</p>
              ) : (
                <ul className="bg-white shadow sm:rounded-lg divide-y">
                  {(jobs as any[]).map((job: any) => (
                    <li key={job.id} className="px-4 py-4">
                      <p className="text-sm font-medium">Job {job.id}</p>
                      <p className="text-xs text-gray-500">Status: {job.status}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'datasets' && (
            <div>
              {(datasets as any[]).length === 0 ? (
                <p className="text-sm text-gray-500">No datasets produced yet</p>
              ) : (
                <ul className="bg-white shadow sm:rounded-lg divide-y">
                  {(datasets as any[]).map((dataset: any) => (
                    <li key={dataset.id} className="px-4 py-4">
                      <Link to={`/datasets/${dataset.id}`} className="text-sm font-medium text-blue-600">
                        {dataset.name}
                      </Link>
                      <p className="text-xs text-gray-500">Format: {dataset.outputFormat}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
