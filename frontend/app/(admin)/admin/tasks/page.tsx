'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, MapPin, Calendar, DollarSign, Users, Loader2 } from 'lucide-react';
import { Task } from '@/types/task';

const statusColors: Record<string, string> = {
  Open: 'bg-green-100 text-green-800 border-green-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  Completed: 'bg-gray-100 text-gray-800 border-gray-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
  Closed: 'bg-gray-100 text-gray-800 border-gray-200',
};

const typeColors: Record<string, string> = {
  Workshop: 'bg-purple-50 text-purple-700',
  Hackathon: 'bg-blue-50 text-blue-700',
  Meetup: 'bg-pink-50 text-pink-700',
  'Part-time Job': 'bg-orange-50 text-orange-700',
  'Full-time Job': 'bg-indigo-50 text-indigo-700',
  'Hourly Job': 'bg-teal-50 text-teal-700',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.location && task.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      task.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1">Manage workshops, hackathons, and events</p>
        </div>
        <Link href="/admin/tasks/create">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
            <Plus className="w-5 h-5" />
            <span>Create Task</span>
          </button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center text-gray-400">
            {searchQuery
              ? 'No tasks found matching your search'
              : 'No tasks yet. Click "Create Task" to get started.'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      typeColors[task.type]
                    }`}
                  >
                    {task.type}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      statusColors[task.status]
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{task.title}</h3>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-3">
                {task.location && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm line-clamp-1">{task.location}</span>
                  </div>
                )}
                {task.date && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">
                      {new Date(task.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-gray-600">
                  <DollarSign className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-semibold">${task.budget}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{task.currentApplicants} applicants</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center space-x-3">
                <Link href={`/admin/tasks/${task.id}/edit`} className="flex-1">
                  <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Edit
                  </button>
                </Link>
                <Link href={`/admin/tasks/${task.id}`} className="flex-1">
                  <button className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-md transition-all">
                    View
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
