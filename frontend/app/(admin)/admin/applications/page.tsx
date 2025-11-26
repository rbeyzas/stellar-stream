'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, User } from 'lucide-react';
import { Application } from '@/types/application';

// Mock data
const mockApplications: Application[] = [
  {
    id: '1',
    applicantId: 'user1',
    applicantName: 'Marcus Rodriguez',
    applicantEmail: 'ambassador1@example.com',
    applicantAvatar: 'MR',
    taskId: '1',
    taskTitle: 'Ethereum Workshop at Stanford',
    taskType: 'Workshop',
    taskLocation: 'Stanford University, CA',
    taskDate: '2025-02-15',
    taskBudget: 500,
    coverLetter: 'I am excited to apply for the Ethereum Workshop at Stanford...',
    status: 'Pending',
    appliedAt: '2024-11-25',
  },
  {
    id: '2',
    applicantId: 'user2',
    applicantName: 'Emily Zhang',
    applicantEmail: 'ambassador2@example.com',
    applicantAvatar: 'EZ',
    taskId: '2',
    taskTitle: 'DeFi Hackathon - ETHGlobal',
    taskType: 'Hackathon',
    taskLocation: 'San Francisco, CA',
    taskDate: '2025-03-20',
    taskBudget: 1500,
    coverLetter: 'With my background in DeFi development...',
    status: 'Pending',
    appliedAt: '2024-11-24',
  },
  {
    id: '3',
    applicantId: 'user3',
    applicantName: 'Alex Kim',
    applicantEmail: 'ambassador3@example.com',
    applicantAvatar: 'AK',
    taskId: '3',
    taskTitle: 'Web3 Community Meetup',
    taskType: 'Meetup',
    taskLocation: 'Austin, TX',
    taskDate: '2025-02-28',
    taskBudget: 300,
    coverLetter: 'I would love to organize this meetup...',
    status: 'Approved',
    appliedAt: '2024-11-26',
    reviewedAt: '2024-11-27',
  },
  {
    id: '4',
    applicantId: 'user4',
    applicantName: 'Jordan Lee',
    applicantEmail: 'ambassador4@example.com',
    applicantAvatar: 'JL',
    taskId: '4',
    taskTitle: 'Blockchain Workshop Series',
    taskType: 'Workshop',
    taskLocation: 'Online',
    taskDate: '2025-03-05',
    taskBudget: 800,
    coverLetter: 'My experience in blockchain education...',
    status: 'Rejected',
    appliedAt: '2024-11-23',
    reviewedAt: '2024-11-25',
  },
];

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  'Under Review': 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<'Pending' | 'Reviewed'>('Pending');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingApplications = mockApplications.filter((app) => app.status === 'Pending');
  const reviewedApplications = mockApplications.filter((app) => app.status !== 'Pending');

  const currentApplications = activeTab === 'Pending' ? pendingApplications : reviewedApplications;

  const filteredApplications = currentApplications.filter(
    (app) =>
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-500 mt-1">Review and manage builder applications</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('Pending')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
            activeTab === 'Pending' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending ({pendingApplications.length})
          {activeTab === 'Pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('Reviewed')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
            activeTab === 'Reviewed' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Reviewed ({reviewedApplications.length})
          {activeTab === 'Reviewed' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
          )}
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center text-gray-400">
            {searchQuery
              ? 'No applications found matching your search'
              : `No ${activeTab.toLowerCase()} applications`}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application, index) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                {/* Left Section - Applicant Info */}
                <div className="flex items-start space-x-4 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {application.applicantAvatar}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {application.applicantName}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          statusColors[application.status]
                        }`}
                      >
                        {application.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{application.applicantEmail}</p>

                    {/* Applied For */}
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Applied for:</p>
                      <p className="text-base font-medium text-gray-900">{application.taskTitle}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{application.taskLocation}</span>
                        </span>
                        <span>
                          {new Date(application.taskDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="font-semibold text-green-600">
                          ${application.taskBudget}
                        </span>
                      </div>
                    </div>

                    {/* Applied Date */}
                    <p className="text-xs text-gray-500">
                      {application.status === 'Pending' ? 'Applied' : 'Reviewed'}{' '}
                      {application.status === 'Pending' ? '2 days ago' : '1 day ago'}
                    </p>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center space-x-3 ml-4">
                  {application.status === 'Pending' ? (
                    <Link href={`/admin/applications/${application.id}`}>
                      <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-md transition-all">
                        Review Application
                      </button>
                    </Link>
                  ) : (
                    <Link href={`/admin/applications/${application.id}`}>
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
