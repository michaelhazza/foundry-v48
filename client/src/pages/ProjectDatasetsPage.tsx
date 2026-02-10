import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';

export default function ProjectDatasetsPage() {
  const { projectId } = useParams();

  const { data: datasets = [], isLoading } = useQuery({
    queryKey: ['project-datasets', projectId],
    queryFn: () => api.get(`/projects/${projectId}/datasets`)
  });

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Project Datasets</h1>
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
        ) : (datasets as any[]).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No datasets produced yet.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {(datasets as any[]).map((dataset: any) => (
                <li key={dataset.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <Link to={`/datasets/${dataset.id}`} className="flex-1">
                      <p className="text-sm font-medium text-blue-600">{dataset.name}</p>
                      <p className="text-sm text-gray-500">Format: {dataset.outputFormat}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Records: {dataset.recordCount} | Size: {(dataset.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </Link>
                    <a
                      href={`/api/datasets/${dataset.id}/download`}
                      className="ml-4 text-sm text-blue-600 hover:text-blue-500"
                    >
                      Download
                    </a>
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
