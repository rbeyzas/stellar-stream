'use client';

import { use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import { Task } from '@/types/task';

// Mock data - bu kısım daha sonra API'den gelecek
const mockTask: Task = {
  id: '1',
  title: 'Ethereum Workshop at Stanford',
  type: 'Workshop',
  status: 'Open',
  location: 'Stanford University, CA',
  date: '2025-02-15',
  budget: 500,
  maxApplicants: 1,
  currentApplicants: 3,
  description:
    'Educational workshop about Ethereum development. This workshop will cover the basics of smart contract development, Web3 integration, and DeFi concepts. Participants will get hands-on experience building their first dApp.',
  requirements: [
    'Experience with Ethereum',
    'Public speaking skills',
    'Available for full event duration',
    'Knowledge of Solidity',
  ],
  createdAt: '2024-11-20',
  updatedAt: '2024-11-20',
};

const statusColors = {
  Open: 'bg-green-100 text-green-800 border-green-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  Completed: 'bg-gray-100 text-gray-800 border-gray-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const typeColors = {
  Workshop: 'bg-purple-50 text-purple-700 border-purple-200',
  Hackathon: 'bg-blue-50 text-blue-700 border-blue-200',
  Meetup: 'bg-pink-50 text-pink-700 border-pink-200',
  Conference: 'bg-orange-50 text-orange-700 border-orange-200',
  Other: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function ViewTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // TODO: Fetch task data from API using id
  const task = mockTask;

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      // TODO: API call to delete task
      console.log('Deleting task:', id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/tasks">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Details</h1>
            <p className="text-gray-500 mt-1">View and manage task information</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete</span>
          </button>
          <Link href={`/admin/tasks/${task.id}/edit`}>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
              <Edit className="w-5 h-5" />
              <span>Edit Task</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Task Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {/* Header Section */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  typeColors[task.type]
                }`}
              >
                {task.type}
              </span>
              <span
                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                  statusColors[task.status]
                }`}
              >
                {task.status}
              </span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h2>
          <p className="text-gray-600">{task.description}</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-gray-50">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Location</p>
              <p className="text-gray-900 font-semibold mt-1">{task.location}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Date</p>
              <p className="text-gray-900 font-semibold mt-1">
                {new Date(task.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Budget</p>
              <p className="text-gray-900 font-semibold mt-1">${task.budget}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Applicants</p>
              <p className="text-gray-900 font-semibold mt-1">
                {task.currentApplicants} / {task.maxApplicants}
              </p>
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        {task.requirements && task.requirements.length > 0 && (
          <div className="p-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
            <ul className="space-y-3">
              {task.requirements.map((req, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metadata Section */}
        <div className="p-8 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                Created:{' '}
                {new Date(task.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                Last updated:{' '}
                {new Date(task.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Applicants Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Applicants</h3>
        <div className="text-center py-12 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No applicants yet</p>
        </div>
      </div>
    </div>
  );
}
