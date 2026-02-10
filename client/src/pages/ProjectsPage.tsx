import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <Link
            to="/projects/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            New Project
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div>Loading...</div>
        ) : (projects as any[]).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects yet. Create your first project to get started.</p>
            <Link
              to="/projects/new"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {(projects as any[]).map((project: any) => (
                <li key={project.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <Link to={`/projects/${project.id}`} className="flex-1">
                      <div>
                        <p className="text-sm font-medium text-blue-600">{project.name}</p>
                        <p className="text-sm text-gray-500">{project.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Status: <span className="font-medium">{project.status}</span>
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this project?')) {
                          deleteMutation.mutate(project.id);
                        }
                      }}
                      className="ml-4 text-sm text-red-600 hover:text-red-500"
                    >
                      Delete
                    </button>
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
