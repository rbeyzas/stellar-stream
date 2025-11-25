'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Task } from '@/lib/types/admin';
import { getTask } from '@/lib/api/admin';
import StatusBadge from '@/components/admin/StatusBadge';
import ApplicationsList from '@/components/admin/ApplicationsList';
import Link from 'next/link';

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params?.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTask = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTask(taskId);
      setTask(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      loadTask();
    }
  }, [taskId, loadTask]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Task not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
          <p className="text-sm text-gray-600">Task ID: {task.taskId}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={task.status} />
          <Link
            href={`/admin/tasks/${task.taskId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit Task
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Task Details (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Location & Language */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location & Language</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Country:</span>
                <span className="ml-2 font-medium text-gray-900">{task.country}</span>
              </div>
              {task.city && (
                <div>
                  <span className="text-gray-600">City:</span>
                  <span className="ml-2 font-medium text-gray-900">{task.city}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Language:</span>
                <span className="ml-2 font-medium text-gray-900">{task.language}</span>
              </div>
              {task.ecosystemId && (
                <div>
                  <span className="text-gray-600">Ecosystem:</span>
                  <span className="ml-2 font-medium text-gray-900">{task.ecosystemId}</span>
                </div>
              )}
            </div>
          </div>

          {/* KPI Requirements */}
          {task.kpiRequirements.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">KPI Requirements</h2>
              <div className="space-y-3">
                {task.kpiRequirements.map((kpi) => (
                  <div key={kpi.kpiRequirementId} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-baseline gap-3">
                      <span className="font-medium text-gray-900">{kpi.metric}:</span>
                      <span className="text-blue-600 font-semibold">{kpi.target}</span>
                    </div>
                    {kpi.description && (
                      <p className="text-sm text-gray-600 mt-1">{kpi.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deliverable Requirements */}
          {task.deliverableRequirements.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Deliverable Requirements</h2>
              <div className="space-y-3">
                {task.deliverableRequirements.map((deliverable) => (
                  <div key={deliverable.requirementId} className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-baseline gap-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                        {deliverable.type}
                      </span>
                      {deliverable.minQuantity && (
                        <span className="text-sm text-gray-600">
                          Min: {deliverable.minQuantity}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{deliverable.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Meta Info & Applications (1/3) */}
        <div className="space-y-6">
          {/* Budget & Dates */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Budget:</span>
                <span className="ml-2 font-bold text-blue-600">{task.budgetUSDC} USDC</span>
              </div>
              <div>
                <span className="text-gray-600">Applications:</span>
                <span className="ml-2 font-medium text-gray-900">{task.applicationCount || 0}</span>
              </div>
              {task.applicationDeadline && (
                <div>
                  <span className="text-gray-600">Application Deadline:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(task.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Event Start:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(task.eventStartDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Event End:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(task.eventEndDate).toLocaleDateString()}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
              {task.assignedAmbassadorId && (
                <div>
                  <span className="text-gray-600">Assigned To:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {task.assignedAmbassadorId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Applications */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Applications</h2>
            <ApplicationsList taskId={task.taskId} onApplicationUpdate={loadTask} />
          </div>
        </div>
      </div>
    </div>
  );
}
