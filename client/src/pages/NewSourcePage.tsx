import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';
import { TeamworkDeskConfig } from '../components/TeamworkDeskConfig';

type SourceSelection = 'file' | 'teamwork_desk' | '';

interface TeamworkDeskConnectionConfig {
  siteName: string;
  apiKey: string;
  dataType: 'tickets';
}

export default function NewSourcePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [sourceSelection, setSourceSelection] = useState<SourceSelection>('');
  const [file, setFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState('');
  const [teamworkDeskConfig, setTeamworkDeskConfig] = useState<TeamworkDeskConnectionConfig | null>(null);
  const [error, setError] = useState('');

  const createFileMutation = useMutation({
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

  const createTeamworkDeskMutation = useMutation({
    mutationFn: async (payload: {
      projectId: string;
      name: string;
      siteName: string;
      apiKey: string;
      dataType: 'tickets';
    }) => {
      return api.post('/integrations/teamwork-desk/sources', payload);
    },
    onSuccess: () => {
      navigate('/sources');
    },
    onError: (err: any) => {
      setError(err.message);
    }
  });

  const isPending = createFileMutation.isPending || createTeamworkDeskMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (sourceSelection === 'teamwork_desk') {
      if (!teamworkDeskConfig) {
        setError('Please test the connection before creating the source.');
        return;
      }
      createTeamworkDeskMutation.mutate({
        projectId,
        name,
        siteName: teamworkDeskConfig.siteName,
        apiKey: teamworkDeskConfig.apiKey,
        dataType: teamworkDeskConfig.dataType,
      });
      return;
    }

    if (sourceSelection === 'file') {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('sourceType', 'file');
      formData.append('projectId', projectId);
      if (file) {
        formData.append('file', file);
      }
      createFileMutation.mutate(formData);
      return;
    }

    setError('Please select a source type.');
  };

  function handleSourceSelectionChange(value: SourceSelection) {
    setSourceSelection(value);
    setTeamworkDeskConfig(null);
    setFile(null);
    setError('');
  }

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
                  value={sourceSelection}
                  onChange={(e) => handleSourceSelectionChange(e.target.value as SourceSelection)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select a source type...</option>
                  <option value="teamwork_desk">Teamwork Desk</option>
                  <option value="file">File Upload</option>
                </select>
              </div>

              {sourceSelection === 'file' && (
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

              {sourceSelection === 'teamwork_desk' && (
                <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Teamwork Desk Configuration
                  </h3>
                  <TeamworkDeskConfig onConfigChange={setTeamworkDeskConfig} />
                </div>
              )}
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? 'Creating...' : 'Create Source'}
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
