'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Download } from 'lucide-react';
import Link from 'next/link';

interface MyTask {
  id: string;
  title: string;
  location: string;
  date: string;
  budget: number;
  status: 'In Progress' | 'Assigned' | 'Paid';
  dueIn?: string;
  submissionId?: string;
}

// Mock data
const activeTasks: MyTask[] = [
  {
    id: '1',
    title: 'Web3 Community Meetup',
    location: 'Austin, TX',
    date: '2025-02-28',
    budget: 300,
    status: 'In Progress',
    dueIn: '4 days',
  },
  {
    id: '2',
    title: 'Blockchain Workshop Series',
    location: 'Online',
    date: '2025-03-05',
    budget: 600,
    status: 'Assigned',
    dueIn: '11 days',
  },
];

const completedTasks: MyTask[] = [
  {
    id: '3',
    title: 'Smart Contract Workshop',
    location: 'Boston, MA',
    date: '2025-01-15',
    budget: 500,
    status: 'Paid',
    submissionId: '4',
  },
  {
    id: '4',
    title: 'Web3 Hackathon Mentorship',
    location: 'Seattle, WA',
    date: '2025-01-08',
    budget: 800,
    status: 'Paid',
    submissionId: '5',
  },
];

export default function MyTasksPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No tasks yet</p>
          </div>
        ) : (
          currentTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{task.location}</span>
                    </span>
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
                    {task.dueIn && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Due in {task.dueIn}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-3 ml-4">
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      task.status === 'In Progress'
                        ? 'bg-cyan-500 text-cyan-900'
                        : task.status === 'Assigned'
                        ? 'bg-gray-500 text-gray-900'
                        : 'bg-green-500 text-green-900'
                    }`}
                  >
                    {task.status}
                  </span>
                  <span className="text-2xl font-bold text-cyan-500">${task.budget}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {activeTab === 'active' ? (
                  <>
                    <Link href={`/builder/my-tasks/${task.id}/submit`} className="flex-1">
                      <button className="w-full flex items-center justify-center space-x-2 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium">
                        <Download className="w-4 h-4" />
                        <span>Submit Work</span>
                      </button>
                    </Link>
                    <Link href={`/builder/my-tasks/${task.id}`}>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                        View Details
                      </button>
                    </Link>
                  </>
                ) : (
                  <Link href={`/builder/submissions/${task.submissionId}`} className="flex-1">
                    <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                      View Submission
                    </button>
                  </Link>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
