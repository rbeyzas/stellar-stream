'use client';

import { useState, useEffect } from 'react';
import TaskCard from '@/components/ambassador/TaskCard';
import TaskDetailModal from '@/components/ambassador/TaskDetailModal';
import ApplyModal from '@/components/ambassador/ApplyModal';
import { TaskSummary, TaskDetail, ApplicationInput } from '@/lib/types/ambassador';
import { getOpenTasks, getTaskDetail, applyToTask } from '@/lib/api/ambassador';

export default function BrowseTasksPage() {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<TaskDetail | null>(null);

  const [applyingTaskId, setApplyingTaskId] = useState<string | null>(null);
  const [applyingTaskTitle, setApplyingTaskTitle] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOpenTasks();
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (taskId: string) => {
    setSelectedTaskId(taskId);
    try {
      const detail = await getTaskDetail(taskId);
      setSelectedTaskDetail(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task details');
      setSelectedTaskId(null);
    }
  };

  const handleApply = (taskId: string, taskTitle: string) => {
    setApplyingTaskId(taskId);
    setApplyingTaskTitle(taskTitle);
  };

  const handleSubmitApplication = async (application: ApplicationInput) => {
    await applyToTask(application);
    // Show success message (could use a toast notification)
    alert('Application submitted successfully!');
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      searchQuery === '' ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    const location = `${task.city || ''}, ${task.country}`.toLowerCase();
    const matchesLocation =
      filterLocation === '' || location.includes(filterLocation.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Tasks</h1>
          <p className="text-gray-600">
            Find and apply for ambassador tasks that match your skills and interests
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Tasks</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Location
              </label>
              <input
                type="text"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                placeholder="City, Country..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading tasks...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tasks Grid */}
        {!loading && !error && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No tasks found matching your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.taskId}
                    task={task}
                    onViewDetails={() => handleViewDetails(task.taskId)}
                    onApply={() => handleApply(task.taskId, task.title)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          isOpen={!!selectedTaskId}
          onClose={() => {
            setSelectedTaskId(null);
            setSelectedTaskDetail(null);
          }}
          task={selectedTaskDetail}
          onApply={() => {
            if (selectedTaskDetail) {
              handleApply(selectedTaskDetail.taskId, selectedTaskDetail.title);
              setSelectedTaskId(null);
              setSelectedTaskDetail(null);
            }
          }}
        />
      )}

      {/* Apply Modal */}
      {applyingTaskId && (
        <ApplyModal
          isOpen={!!applyingTaskId}
          taskId={applyingTaskId}
          taskTitle={applyingTaskTitle}
          onClose={() => {
            setApplyingTaskId(null);
            setApplyingTaskTitle('');
          }}
          onSubmit={handleSubmitApplication}
        />
      )}
    </div>
  );
}
