import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';

export default function DatasetsPage() {
  const queryClient = useQueryClient();
  const { data: datasets = [], isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => api.get('/datasets')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/datasets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    }
  });

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">Datasets</h1>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div>Loading...</div>
        ) : (datasets as any[]).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No datasets yet.</p>
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
                    <div className="flex items-center space-x-4">
                      <a
                        href={`/api/datasets/${dataset.id}/download`}
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this dataset?')) {
                            deleteMutation.mutate(dataset.id);
                          }
                        }}
                        className="text-sm text-red-600 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
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
