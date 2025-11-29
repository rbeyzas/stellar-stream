'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Download, Loader2, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface KPI {
  id: string;
  name: string;
  target: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  location?: string;
  date?: string;
  budget: number;
  status: string;
  kpis: KPI[];
}

interface Submission {
  id: string;
  workSummary: string;
  status: string;
  createdAt: string;
  kpiResults: Array<{
    id: string;
    name: string;
    target: string;
    achieved: string;
    status: string;
  }>;
}

interface MyTask {
  id: string;
  task: Task;
  applicationId: string;
  submission?: Submission;
}

export default function MyTasksPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [tasks, setTasks] = useState<MyTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcceptedTasks = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          setLoading(false);
          return;
        }

        // Fetch accepted applications
        const response = await fetch(
          `/api/applications?builderEmail=${encodeURIComponent(userEmail)}&status=accepted`,
        );
        if (!response.ok) {
          setLoading(false);
          return;
        }

        const applications = await response.json();

        // Fetch submissions for this builder
        const submissionsResponse = await fetch(
          `/api/submissions?builderEmail=${encodeURIComponent(userEmail)}`,
        );
        const submissions = submissionsResponse.ok ? await submissionsResponse.json() : [];

        // Fetch full task details for each accepted application
        const tasksWithDetails = await Promise.all(
          applications.map(async (app: any) => {
            const taskResponse = await fetch(`/api/tasks/${app.taskId}`);
            if (taskResponse.ok) {
              const task = await taskResponse.json();
              // Find submission for this task
              const submission = submissions.find(
                (s: any) => s.taskId === app.taskId && s.status !== 'draft',
              );
              return {
                id: app.taskId,
                task,
                applicationId: app.id,
                submission,
              };
            }
            return null;
          }),
        );

        setTasks(tasksWithDetails.filter((t): t is MyTask => t !== null));
      } catch (error) {
        console.error('Error fetching accepted tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const activeTasks = tasks.filter((t) => !t.submission);
  const completedTasks = tasks.filter((t) => t.submission);

  const currentTasks = activeTab === 'active' ? activeTasks : completedTasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-500 mt-1">Manage your assigned and completed tasks</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active ({activeTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({completedTasks.length})
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {currentTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-2">
              {activeTab === 'active' ? 'No active tasks yet' : 'No completed tasks yet'}
            </p>
            <p className="text-sm text-gray-400">
              {activeTab === 'active'
                ? 'When admins accept your applications, tasks will appear here'
                : 'Completed tasks will appear here'}
            </p>
            {activeTab === 'active' && (
              <Link href="/builder/tasks">
                <button className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
                  Browse Available Tasks
                </button>
              </Link>
            )}
          </div>
        ) : (
          currentTasks.map((myTask, index) => {
            const { task } = myTask;
            return (
              <motion.div
                key={myTask.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {task.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{task.location}</span>
                        </span>
                      )}
                      {task.date && (
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(task.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3 ml-4">
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        activeTab === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {activeTab === 'completed' ? (
                        <span className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Submitted</span>
                        </span>
                      ) : (
                        'Accepted'
                      )}
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      ${task.budget.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action buttons or submission details */}
                {activeTab === 'active' ? (
                  <div className="flex items-center space-x-3">
                    <Link href={`/builder/my-tasks/${task.id}/submit`} className="flex-1">
                      <button className="w-full flex items-center justify-center space-x-2 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium">
                        <Download className="w-4 h-4" />
                        <span>Submit Work</span>
                      </button>
                    </Link>
                    <Link href={`/builder/tasks/${task.id}`}>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                        View Details
                      </button>
                    </Link>
                  </div>
                ) : (
                  myTask.submission && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">Submission Details</h4>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            myTask.submission.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : myTask.submission.status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {myTask.submission.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {myTask.submission.workSummary}
                      </p>
                      <div className="text-xs text-gray-500 mb-3">
                        Submitted on{' '}
                        {new Date(myTask.submission.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      {myTask.submission.kpiResults.length > 0 && (
                        <div className="space-y-2 mb-3">
                          <p className="text-xs font-semibold text-gray-700">KPI Results:</p>
                          {myTask.submission.kpiResults.map((kpi) => (
                            <div
                              key={kpi.id}
                              className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded"
                            >
                              <span className="text-gray-700">{kpi.name}</span>
                              <span className="text-gray-900 font-medium">
                                {kpi.achieved} / {kpi.target}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <Link href={`/builder/submissions/${myTask.submission.id}`}>
                        <button className="w-full flex items-center justify-center space-x-2 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                          <FileText className="w-4 h-4" />
                          <span>View Full Submission</span>
                        </button>
                      </Link>
                    </div>
                  )
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
