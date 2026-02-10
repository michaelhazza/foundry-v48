import React, { useState } from 'react';
import { useMutation } from '@tantml:react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';

export default function NewSourcePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [sourceType, setSourceType] = useState<'file' | 'api'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState('');
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return api.uploadFile('/sources', formData);
    },
    onSuccess: () => {
      navigate('/sources');
    },
    onError: (err: any) => {
      setError(err.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('sourceType', sourceType);
    formData.append('projectId', projectId);
    if (file) {
      formData.append('file', file);
    }
    createMutation.mutate(formData);
  };

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">Create New Source</h1>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow sm:rounded-lg">
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Source Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project ID *
                </label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  required
                  placeholder="Enter project ID"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Source Type *
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as any)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="file">File Upload</option>
                  <option value="api">API Connection</option>
                </select>
              </div>

              {sourceType === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Upload File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".csv,.xlsx,.json"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Source'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/sources')}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
