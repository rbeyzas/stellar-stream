import { useState, useEffect, useCallback } from 'react';
import { TaskApplication } from '@/lib/types/admin';
import StatusBadge from './StatusBadge';
import { assignTask, rejectApplication, getTaskApplications } from '@/lib/api/admin';

interface ApplicationsListProps {
  taskId: string;
  onApplicationUpdate?: () => void;
}

export default function ApplicationsList({ taskId, onApplicationUpdate }: ApplicationsListProps) {
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    try {
      setLoadingApps(true);
      const data = await getTaskApplications(taskId);
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoadingApps(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleAssign = async (applicationId: string) => {
    if (!confirm('Are you sure you want to assign this ambassador to the task?')) {
      return;
    }

    setLoading(applicationId);
    setError(null);

    try {
      await assignTask(taskId, applicationId);
      alert('Ambassador assigned successfully!');
      loadApplications();
      onApplicationUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    setLoading(applicationId);
    setError(null);

    try {
      await rejectApplication(applicationId, reason);
      alert('Application rejected');
      loadApplications();
      onApplicationUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setLoading(null);
    }
  };

  if (loadingApps) {
    return <div className="text-center py-8 text-gray-500">Loading applications...</div>;
  }

  if (applications.length === 0) {
    return <div className="text-center py-8 text-gray-500">No applications yet</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {applications.map((application) => (
        <div
          key={application.applicationId}
          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-900">
                Ambassador ID: {application.ambassadorId}
              </h4>
              <p className="text-sm text-gray-500">
                Applied: {new Date(application.appliedAt).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge status={application.status} />
          </div>

          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
            <p className="text-sm text-gray-600 line-clamp-3">{application.coverLetter}</p>
          </div>

          {application.pastRelevantExperience && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Experience:</p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {application.pastRelevantExperience}
              </p>
            </div>
          )}

          {application.status === 'PENDING' && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleAssign(application.applicationId)}
                disabled={loading === application.applicationId}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading === application.applicationId ? 'Assigning...' : 'Accept & Assign'}
              </button>
              <button
                onClick={() => handleReject(application.applicationId)}
                disabled={loading === application.applicationId}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
