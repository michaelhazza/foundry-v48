import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';

export default function ProcessingJobDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ['processing-job', id],
    queryFn: () => api.get(`/processing-jobs/${id}`)
  });

  const retryMutation = useMutation({
    mutationFn: () => api.post(`/processing-jobs/${id}/retry`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing-job', id] });
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  const jobData = job as any;

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">Processing Job Details</h1>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Job ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{jobData?.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    jobData?.status === 'completed' ? 'bg-green-100 text-green-800' :
                    jobData?.status === 'failed' ? 'bg-red-100 text-red-800' :
                    jobData?.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {jobData?.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Triggered By</dt>
                <dd className="mt-1 text-sm text-gray-900">{jobData?.triggeredBy}</dd>
              </div>
              {jobData?.startedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Started At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(jobData.startedAt).toLocaleString()}
                  </dd>
                </div>
              )}
              {jobData?.completedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Completed At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(jobData.completedAt).toLocaleString()}
                  </dd>
                </div>
              )}
              {jobData?.inputRecordCount !== null && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Input Records</dt>
                  <dd className="mt-1 text-sm text-gray-900">{jobData.inputRecordCount}</dd>
                </div>
              )}
              {jobData?.outputRecordCount !== null && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Output Records</dt>
                  <dd className="mt-1 text-sm text-gray-900">{jobData.outputRecordCount}</dd>
                </div>
              )}
              {jobData?.errorMessage && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Error Message</dt>
                  <dd className="mt-1 text-sm text-red-600">{jobData.errorMessage}</dd>
                </div>
              )}
            </dl>

            {jobData?.status === 'failed' && (
              <div className="mt-6">
                <button
                  onClick={() => retryMutation.mutate()}
                  disabled={retryMutation.isPending}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {retryMutation.isPending ? 'Retrying...' : 'Retry Job'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
