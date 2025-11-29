'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Calendar, TrendingUp, Users, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Task, KPI } from '@/types/task';
import ApplyModal from '@/components/ApplyModal';

export default function BuilderTaskDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        // Fetch task
        const res = await fetch(`/api/tasks/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTask(data);
        }

        // Check if user has already applied
        const builderEmail = localStorage.getItem('userEmail');
        if (builderEmail) {
          const applicationsRes = await fetch(
            `/api/applications?builderEmail=${encodeURIComponent(builderEmail)}`,
          );
          if (applicationsRes.ok) {
            const applicationsData = await applicationsRes.json();
            const myApplication = applicationsData.find(
              (app: { task: { id: string }; status: string }) => app.task.id === id,
            );
            if (myApplication) {
              setHasApplied(true);
              setApplicationStatus(myApplication.status);
            }
          }
        }
      } catch (e) {
        console.error('Error loading task', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Task not found</p>
        <Link href="/builder/tasks" className="inline-block mt-4">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border hover:bg-gray-200">
            Back to Tasks
          </button>
        </Link>
      </div>
    );
  }

  const handleStartTask = async () => {
    if (!confirm('Are you ready to start this task? The admin will be notified to fund the stream.')) {
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${id}/start`, {
        method: 'POST',
      });

      if (res.ok) {
        alert('Task started! Waiting for admin approval to fund the stream.');
        // Refresh task data
        const taskRes = await fetch(`/api/tasks/${id}`);
        const taskData = await taskRes.json();
        setTask(taskData);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (e) {
      console.error('Error starting task', e);
      alert('Failed to start task');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header with gradient background */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white"
      >
        <Link
          href="/builder/tasks"
          className="inline-flex items-center space-x-2 mb-4 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Tasks</span>
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                {task.type}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                {task.status}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
            <div className="flex items-center space-x-4 text-white/90">
              {task.location && (
                <span className="flex items-center space-x-1 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{task.location}</span>
                </span>
              )}
              {task.date && (
                <span className="flex items-center space-x-1 text-sm">
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
          <div className="text-right">
            <div className="text-sm text-white/80 mb-1">Budget</div>
            <div className="text-4xl font-bold">${task.budget}</div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Task Description</h2>
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {task.description}
          </div>

          {/* Applicants Count */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-5 h-5" />
              <span className="font-medium">{task.currentApplicants ?? 0} builders applied</span>
            </div>
          </div>
        </motion.div>

        {/* KPIs Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-2 text-lg font-bold text-gray-900 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span>Key Performance Indicators</span>
          </div>
          <div className="space-y-3">
            {(task.kpis ?? []).length === 0 ? (
              <div className="text-gray-500 text-sm">No KPIs specified.</div>
            ) : (
              (task.kpis ?? []).map((kpi: KPI, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                >
                  <div className="flex items-start space-x-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{kpi.name}</div>
                      <div className="text-sm text-gray-600 mt-1">Target: {kpi.target}</div>
                      {kpi.description && (
                        <div className="text-xs text-gray-500 mt-2">{kpi.description}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {hasApplied
                ? task.status === 'In Progress'
                  ? 'Task in Progress'
                  : applicationStatus === 'Approved'
                    ? 'Application Approved'
                    : 'Application Submitted'
                : 'Ready to apply?'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {hasApplied
                ? task.status === 'In Progress'
                  ? 'This task is currently active. Check your Stream Dashboard for earnings.'
                  : applicationStatus === 'Approved'
                    ? 'Your application has been approved! You can now start the task.'
                    : 'You have already applied to this task. Check My Applications for status updates.'
                : 'Submit your application and showcase your skills'}
            </p>
          </div>
          {hasApplied ? (
            task.status === 'In Progress' ? (
              <Link href="/builder/stream" className="w-full sm:w-auto">
                <button className="w-full px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  Go to Stream Dashboard
                </button>
              </Link>
            ) : applicationStatus === 'Approved' ? (
              <button
                onClick={handleStartTask}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors hover:shadow-lg"
              >
                Start Task
              </button>
            ) : (
              <Link href="/builder/my-applications" className="w-full sm:w-auto">
                <button className="w-full px-8 py-3 bg-gray-400 text-white rounded-lg font-semibold cursor-default">
                  View Application Status
                </button>
              </Link>
            )
          ) : (
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              Apply for This Task
            </button>
          )}
        </div>
      </motion.div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        taskId={task.id}
        taskTitle={task.title}
        onSuccess={() => {
          setHasApplied(true);
          setApplicationStatus('Pending');
          alert('Application submitted successfully! Check My Applications to track your status.');
        }}
      />
    </div>
  );
}
