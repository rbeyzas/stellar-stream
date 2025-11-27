'use client';

import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, Clock, MapPin, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Mock data for active tasks
const activeTasks = [
  {
    id: '1',
    title: 'Web3 Community Meetup',
    location: 'Austin, TX',
    date: '2025-02-28',
    dueIn: '4 days',
    status: 'In Progress',
  },
  {
    id: '2',
    title: 'Blockchain Workshop Series',
    location: 'Online',
    date: '2025-03-05',
    dueIn: '11 days',
    status: 'Assigned',
  },
];

// Mock data for available opportunities
const opportunities = [
  {
    id: '1',
    title: 'Ethereum Workshop at Stanford',
    type: 'Workshop',
    location: 'Stanford University, CA',
    date: '2025-02-15',
    budget: 500,
  },
  {
    id: '2',
    title: 'DeFi Hackathon - ETHGlobal',
    type: 'Hackathon',
    location: 'San Francisco, CA',
    date: '2025-03-20',
    budget: 1500,
  },
];

export default function BuilderDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, Marcus!</h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your ambassador activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Active Tasks</h3>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">3</p>
          <p className="text-sm text-gray-500 mt-1">In progress</p>
        </motion.div>

        {/* Completed Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Completed Tasks</h3>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">12</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </motion.div>

        {/* Total Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Earnings</h3>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">$8,450</p>
          <p className="text-sm text-green-600 mt-1">+$500 this month</p>
        </motion.div>

        {/* Pending Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Pending Reviews</h3>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">2</p>
          <p className="text-sm text-gray-500 mt-1">Awaiting approval</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tasks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Active Tasks</h2>
            <Link href="/builder/campaigns">
              <button className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700 font-medium">
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="space-y-4">
            {activeTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{task.location}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(task.date).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      task.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Due in {task.dueIn}
                  </span>
                  <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Available Opportunities Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Available Opportunities</h2>
            <Link href="/builder/campaigns">
              <button className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700 font-medium">
                <span>Browse All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="space-y-4">
            {opportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{opportunity.title}</h3>
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded mt-2">
                      {opportunity.type}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">${opportunity.budget}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{opportunity.location}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(opportunity.date).toLocaleDateString()}</span>
                  </span>
                </div>
                <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium">
                  Apply Now
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
