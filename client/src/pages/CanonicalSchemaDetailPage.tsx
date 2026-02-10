import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';

export default function CanonicalSchemaDetailPage() {
  const { id } = useParams();

  const { data: schema, isLoading } = useQuery({
    queryKey: ['canonical-schema', id],
    queryFn: () => api.get(`/canonical-schemas/${id}`)
  });

  if (isLoading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  const schemaData = schema as any;

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">
          {schemaData?.name} v{schemaData?.version}
        </h1>
        <p className="mt-2 text-sm text-gray-500">{schemaData?.description}</p>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Version</dt>
                <dd className="mt-1 text-sm text-gray-900">{schemaData?.version}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {schemaData?.isPublished ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Draft
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Schema Definition Version</dt>
                <dd className="mt-1 text-sm text-gray-900">{schemaData?.schemaDefinitionVersion}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(schemaData?.createdAt).toLocaleString()}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Schema Definition</h4>
              <pre className="bg-gray-50 rounded-md p-4 text-xs overflow-auto max-h-96">
                {JSON.stringify(schemaData?.schemaDefinition, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
