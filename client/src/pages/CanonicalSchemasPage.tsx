import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';

export default function CanonicalSchemasPage() {
  const { data: schemas = [], isLoading } = useQuery({
    queryKey: ['canonical-schemas'],
    queryFn: () => api.get('/canonical-schemas')
  });

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">Canonical Schemas</h1>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div>Loading...</div>
        ) : (schemas as any[]).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No canonical schemas available.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {(schemas as any[]).map((schema: any) => (
                <li key={schema.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <Link to={`/canonical-schemas/${schema.id}`}>
                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        {schema.name} v{schema.version}
                      </p>
                      <p className="text-sm text-gray-500">{schema.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {schema.isPublished ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Draft
                          </span>
                        )}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}
