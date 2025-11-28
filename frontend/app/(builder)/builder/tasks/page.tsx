'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Task } from '@/types/task';

export default function BrowseTasksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedTaskIds, setAppliedTaskIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tasks
        const tasksRes = await fetch('/api/tasks');
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }

        // Fetch user's applications
        const builderEmail = localStorage.getItem('userEmail');
        if (builderEmail) {
          const applicationsRes = await fetch(
            `/api/applications?builderEmail=${encodeURIComponent(builderEmail)}`,
          );
          if (applicationsRes.ok) {
            const applicationsData = await applicationsRes.json();
            const taskIds = new Set<string>(
              applicationsData.map((app: { task: { id: string } }) => app.task.id),
            );
            setAppliedTaskIds(taskIds);
          }
        }
      } catch (e) {
        console.error('Error fetching data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.location ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'All Types' || task.type === selectedType;

    return matchesSearch && matchesType;
  });

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      Workshop: 'bg-purple-100 text-purple-800',
      Hackathon: 'bg-pink-100 text-pink-800',
      Meetup: 'bg-blue-100 text-blue-800',
      Conference: 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Tasks</h1>
        <p className="text-gray-500 mt-1">Find and apply for workshops, hackathons, and events</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
        >
          {[
            'All Types',
            'Workshop',
            'Hackathon',
            'Meetup',
            'Part-time Job',
            'Full-time Job',
            'Hourly Job',
          ].map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No tasks found</p>
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(
                    task.type,
                  )}`}
                >
                  {task.type}
                </span>
                <span className="text-2xl font-bold text-purple-600">${task.budget}</span>
              </div>

              {/* Title and Description */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>

              {/* Location and Date */}
              <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{task.location}</span>
                </span>
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

              {/* Applicants Info */}
              <div className="mb-4 text-sm text-gray-600">
                <span>{task.currentApplicants ?? 0} applicants</span>
              </div>

              {/* KPIs */}
              <div className="mb-4">
                <div className="flex items-center space-x-1 text-sm font-medium text-gray-700 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Key Performance Indicators</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(task.kpis ?? []).map((kpi, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {kpi.name}: {kpi.target}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                {appliedTaskIds.has(task.id) ? (
                  <button
                    disabled
                    className="flex-1 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm font-medium"
                  >
                    Already Applied
                  </button>
                ) : (
                  <Link href={`/builder/tasks/${task.id}`} className="flex-1">
                    <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium">
                      Apply Now
                    </button>
                  </Link>
                )}
                <Link href={`/builder/tasks/${task.id}`}>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    View Details
                  </button>
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
