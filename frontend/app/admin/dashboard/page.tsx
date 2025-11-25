'use client';

import { useEffect, useState } from 'react';
import { DashboardStats, Task, Assignment } from '@/lib/types/admin';
import { getDashboardStats, getTasks, getAssignments } from '@/lib/api/admin';
import SummaryCard from '@/components/admin/SummaryCard';
import StatusBadge from '@/components/admin/StatusBadge';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, tasksData, assignmentsData] = await Promise.all([
        getDashboardStats(),
        getTasks({ limit: 5, status: 'ACTIVE' }),
        getAssignments({ status: 'IN_PROGRESS' }).catch(() => []),
      ]);

      setStats(statsData);
      setRecentTasks(tasksData.tasks || []);
      setRecentAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link
          href="/admin/tasks/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Task
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard title="Total Tasks" value={stats?.totalTasks || 0} icon="📋" />
        <SummaryCard title="Active Tasks" value={stats?.activeTasks || 0} icon="⚡" />
        <SummaryCard title="Open Applications" value={stats?.openApplications || 0} icon="📝" />
        <SummaryCard title="Pending Submissions" value={stats?.pendingSubmissions || 0} icon="⏳" />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Active Tasks</h2>
            <Link href="/admin/tasks" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <p className="text-gray-500 text-sm">No active tasks</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <Link
                  key={task.taskId}
                  href={`/admin/tasks/${task.taskId}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Budget: {task.budgetUSDC} USDC</span>
                    <span>Applications: {task.applicationCount || 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Assignments */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">In-Progress Assignments</h2>
          </div>

          {recentAssignments?.length === 0 ? (
            <p className="text-gray-500 text-sm">No in-progress assignments</p>
          ) : (
            <div className="space-y-3">
              {recentAssignments?.map((assignment) => (
                <div
                  key={assignment.assignmentId}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{assignment.taskId}</p>
                      <p className="text-xs text-gray-600">Ambassador: {assignment.ambassadorId}</p>
                    </div>
                    <StatusBadge status={assignment.status} />
                  </div>
                  <div className="text-xs text-gray-500">
                    Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
