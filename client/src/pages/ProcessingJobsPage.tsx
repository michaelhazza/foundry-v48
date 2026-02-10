import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';

export default function ProcessingJobsPage() {
  const queryClient = useQueryClient();
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['processing-jobs'],
    queryFn: () => api.get('/processing-jobs')
  });

  const retryMutation = useMutation({
    mutationFn: (jobId: string) => api.post(`/processing-jobs/${jobId}/retry`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing-jobs'] });
    }
  });

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">Processing Jobs</h1>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div>Loading...</div>
        ) : (jobs as any[]).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No processing jobs yet.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {(jobs as any[]).map((job: any) => (
                <li key={job.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <Link to={`/processing-jobs/${job.id}`} className="flex-1">
                      <p className="text-sm font-medium text-blue-600">
                        Job {job.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">Status: {job.status}</p>
                      {job.startedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Started: {new Date(job.startedAt).toLocaleString()}
                        </p>
                      )}
                    </Link>
                    {job.status === 'failed' && (
                      <button
                        onClick={() => retryMutation.mutate(job.id)}
                        className="ml-4 text-sm text-blue-600 hover:text-blue-500"
                      >
                        Retry
                      </button>
                    )}
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
