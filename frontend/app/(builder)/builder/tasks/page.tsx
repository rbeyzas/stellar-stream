'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, TrendingUp, Filter } from 'lucide-react';
import Link from 'next/link';
import { Task } from '@/types/task';

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Ethereum Workshop at Stanford',
    description:
      'Host a 2-hour workshop introducing Ethereum development to computer science students',
    type: 'Workshop',
    location: 'Stanford University, CA',
    date: '2025-02-15',
    budget: 500,
    status: 'Open',
    kpis: [
      { name: 'Attendees', target: '30+' },
      { name: 'Social Media Reach', target: '5000+' },
    ],
    currentApplicants: 3,
    maxApplicants: 1,
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    title: 'DeFi Hackathon - ETHGlobal',
    description:
      'Represent our protocol at ETHGlobal hackathon, provide mentorship and judge projects',
    type: 'Hackathon',
    location: 'San Francisco, CA',
    date: '2025-03-20',
    budget: 1500,
    status: 'Open',
    kpis: [
      { name: 'Projects Mentored', target: '10+' },
      { name: 'Developer Signups', target: '50+' },
    ],
    currentApplicants: 5,
    maxApplicants: 2,
    createdAt: '2025-01-20',
  },
  {
    id: '3',
    title: 'Web3 Developer Meetup',
    description: 'Organize and host a local Web3 developer meetup with technical presentations',
    type: 'Meetup',
    location: 'New York, NY',
    date: '2025-03-10',
    budget: 400,
    status: 'Open',
    kpis: [
      { name: 'Attendees', target: '40+' },
      { name: 'New Community Members', target: '15+' },
    ],
    currentApplicants: 2,
    maxApplicants: 1,
    createdAt: '2025-01-18',
  },
  {
    id: '4',
    title: 'Blockchain Conference Booth',
    description: 'Staff our booth at a major blockchain conference and engage with attendees',
    type: 'Conference',
    location: 'Miami, FL',
    date: '2025-04-05',
    budget: 800,
    status: 'Open',
    kpis: [
      { name: 'Booth Visitors', target: '200+' },
      { name: 'Email Signups', target: '100+' },
    ],
    currentApplicants: 4,
    maxApplicants: 2,
    createdAt: '2025-01-22',
  },
];

const taskTypes = ['All Types', 'Workshop', 'Hackathon', 'Meetup', 'Conference'];

export default function BrowseTasksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTasks = mockTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          {taskTypes.map((type) => (
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
              </div>

              {/* Applicants Info */}
              <div className="flex items-center space-x-1 mb-4 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>
                  {task.currentApplicants} applicants / {task.maxApplicants} max
                </span>
              </div>

              {/* KPIs */}
              <div className="mb-4">
                <div className="flex items-center space-x-1 text-sm font-medium text-gray-700 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Key Performance Indicators</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.kpis.map((kpi, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {kpi.name}: {kpi.target}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <Link href={`/builder/tasks/${task.id}`} className="flex-1">
                  <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium">
                    Apply Now
                  </button>
                </Link>
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
