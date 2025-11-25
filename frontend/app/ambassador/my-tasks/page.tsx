'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MyTaskCard from '@/components/ambassador/MyTaskCard';
import { AssignmentSummary, Application } from '@/lib/types/ambassador';
import { getMyAssignments, getMyApplications } from '@/lib/api/ambassador';

type TabType = 'active' | 'completed' | 'applications';

export default function MyTasksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('active');

  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignmentsData, applicationsData] = await Promise.all([
        getMyAssignments(),
        getMyApplications(),
      ]);
      setAssignments(assignmentsData.assignments);
      setApplications(applicationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const activeAssignments = assignments.filter(
    (a) =>
      a.status === 'ASSIGNED' || a.status === 'AWAITING_SUBMISSION' || a.status === 'UNDER_REVIEW',
  );

  const completedAssignments = assignments.filter(
    (a) => a.status === 'APPROVED' || a.status === 'COMPLETED',
  );

  const handleAssignmentClick = (assignmentId: string) => {
    router.push(`/ambassador/tasks/${assignmentId}`);
  };

  const applicationStatusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tasks</h1>
          <p className="text-gray-600">Manage your assignments and track your applications</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'active'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active Assignments ({activeAssignments.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({completedAssignments.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'applications'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Applications ({applications.length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Active Assignments Tab */}
            {activeTab === 'active' && (
              <div>
                {activeAssignments.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-500">No active assignments.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeAssignments.map((assignment) => (
                      <MyTaskCard
                        key={assignment.assignmentId}
                        assignment={assignment}
                        onClick={() => handleAssignmentClick(assignment.assignmentId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Completed Assignments Tab */}
            {activeTab === 'completed' && (
              <div>
                {completedAssignments.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-500">No completed assignments yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedAssignments.map((assignment) => (
                      <MyTaskCard
                        key={assignment.assignmentId}
                        assignment={assignment}
                        onClick={() => handleAssignmentClick(assignment.assignmentId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div>
                {applications.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-500">No applications submitted yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div
                        key={app.applicationId}
                        className="bg-white border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              Application for Task
                            </h3>
                            <p className="text-sm text-gray-600">
                              Applied on {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              applicationStatusColors[app.status]
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Cover Letter:</p>
                            <p className="text-sm text-gray-600 mt-1">{app.coverLetter}</p>
                          </div>

                          {app.pastRelevantExperience && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Experience:</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {app.pastRelevantExperience}
                              </p>
                            </div>
                          )}

                          {app.status === 'REJECTED' && app.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                              <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                              <p className="text-sm text-red-700 mt-1">{app.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
