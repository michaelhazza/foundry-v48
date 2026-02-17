import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';

const SOURCE_TYPE_LABELS: Record<string, string> = {
  file: 'File Upload',
  api: 'API Connection',
};

const API_PROVIDER_LABELS: Record<string, string> = {
  teamwork_desk: 'Teamwork Desk',
};

function getSourceTypeLabel(sourceType: string): string {
  return SOURCE_TYPE_LABELS[sourceType] ?? sourceType;
}

function getApiProviderLabel(provider: string): string {
  return API_PROVIDER_LABELS[provider] ?? provider;
}

export default function ProjectSourcesPage() {
  const { projectId } = useParams();

  const { data: sources = [], isLoading, isError, error } = useQuery({
    queryKey: ['project-sources', projectId],
    queryFn: () => api.get(`/projects/${projectId}/sources`)
  });

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Project Sources</h1>
          <Link
            to={`/projects/${projectId}`}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Back to Project
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div>Loading...</div>
        ) : isError ? (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Failed to load sources: {(error as Error)?.message ?? 'Unknown error'}
            </p>
          </div>
        ) : (sources as any[]).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No sources configured for this project.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {(sources as any[]).map((source: any) => (
                <li key={source.id} className="px-4 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{source.name}</p>
                    <p className="text-sm text-gray-500">
                      Type: {getSourceTypeLabel(source.sourceType)}
                      {source.sourceType === 'api' && source.apiConnectionConfig?.provider && (
                        <span className="ml-1 text-gray-400">
                          ({getApiProviderLabel(source.apiConnectionConfig.provider)})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Status: {source.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}
