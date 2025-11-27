'use client';

import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

interface MyApplication {
  id: string;
  taskId: string;
  taskTitle: string;
  location: string;
  date: string;
  budget: number;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  appliedAt: string;
}

// Mock data
const mockApplications: MyApplication[] = [
  {
    id: '1',
    taskId: '1',
    taskTitle: 'Ethereum Workshop at Stanford',
    location: 'Stanford University, CA',
    date: '2025-02-15',
    budget: 500,
    status: 'Pending Review',
    appliedAt: '2025-01-25',
  },
  {
    id: '2',
    taskId: '2',
    taskTitle: 'DeFi Hackathon - ETHGlobal',
    location: 'San Francisco, CA',
    date: '2025-03-20',
    budget: 1500,
    status: 'Approved',
    appliedAt: '2025-01-20',
  },
  {
    id: '3',
    taskId: '4',
    taskTitle: 'Blockchain Conference Booth',
    location: 'Miami, FL',
    date: '2025-04-05',
    budget: 800,
    status: 'Rejected',
    appliedAt: '2025-01-18',
  },
];

const statusConfig = {
  'Pending Review': {
    color: 'bg-yellow-500 text-yellow-900',
    label: 'Pending Review',
  },
  Approved: {
    color: 'bg-cyan-500 text-cyan-900',
    label: 'Approved',
  },
  Rejected: {
    color: 'bg-red-500 text-red-900',
    label: 'Rejected',
  },
};

export default function MyApplicationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 mt-1">Track the status of your task applications</p>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {mockApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No applications yet</p>
          </div>
        ) : (
          mockApplications.map((application, index) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{application.taskTitle}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{application.location}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(application.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        Applied{' '}
                        {Math.ceil(
                          (new Date().getTime() - new Date(application.appliedAt).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}{' '}
                        days ago
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-3 ml-4">
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      statusConfig[application.status].color
                    }`}
                  >
                    {statusConfig[application.status].label}
                  </span>
                  <span className="text-2xl font-bold text-cyan-500">${application.budget}</span>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link href={`/builder/my-applications/${application.id}`}>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    View Application
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
