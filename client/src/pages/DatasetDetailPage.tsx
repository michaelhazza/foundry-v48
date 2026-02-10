import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';

export default function DatasetDetailPage() {
  const { id } = useParams();

  const { data: dataset, isLoading } = useQuery({
    queryKey: ['dataset', id],
    queryFn: () => api.get(`/datasets/${id}`)
  });

  if (isLoading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  const datasetData = dataset as any;

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">{datasetData?.name}</h1>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Dataset Metadata
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Output Format</dt>
                <dd className="mt-1 text-sm text-gray-900">{datasetData?.outputFormat}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Record Count</dt>
                <dd className="mt-1 text-sm text-gray-900">{datasetData?.recordCount}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">File Size</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {(datasetData?.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(datasetData?.createdAt).toLocaleString()}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Lineage Data</h4>
              <pre className="bg-gray-50 rounded-md p-4 text-xs overflow-auto">
                {JSON.stringify(datasetData?.lineageData, null, 2)}
              </pre>
            </div>

            <div className="mt-6">
              <a
                href={`/api/datasets/${id}/download`}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Download Dataset
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
