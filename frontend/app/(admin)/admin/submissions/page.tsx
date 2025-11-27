'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, File } from 'lucide-react';
import { Submission } from '@/types/submission';

// Mock data
const mockSubmissions: Submission[] = [
  {
    id: '1',
    builderId: 'user1',
    builderName: 'Marcus Rodriguez',
    builderEmail: 'builder1@example.com',
    builderAvatar: 'MR',
    taskId: '3',
    taskTitle: 'Web3 Community Meetup',
    taskLocation: 'Austin, TX',
    taskDate: '2025-02-28',
    taskBudget: 300,
    workSummary: 'Successfully organized and hosted the Web3 Community Meetup in Austin...',
    kpiResults: [
      { name: 'Attendees', target: '50+', achieved: '65', status: 'Achieved' },
      { name: 'New Community Members', target: '20', achieved: '28', status: 'Achieved' },
    ],
    supportingFiles: [
      { id: '1', name: 'event-photos-1.jpg', size: '2.3 MB', type: 'image/jpeg', url: '#' },
      { id: '2', name: 'event-photos-2.jpg', size: '1.8 MB', type: 'image/jpeg', url: '#' },
      {
        id: '3',
        name: 'presentation-slides.pdf',
        size: '5.2 MB',
        type: 'application/pdf',
        url: '#',
      },
      { id: '4', name: 'event-highlight.mp4', size: '45.8 MB', type: 'video/mp4', url: '#' },
      {
        id: '5',
        name: 'attendee-list.xlsx',
        size: '125 KB',
        type: 'application/vnd.ms-excel',
        url: '#',
      },
      {
        id: '6',
        name: 'social-media-analytics.pdf',
        size: '1.2 MB',
        type: 'application/pdf',
        url: '#',
      },
    ],
    status: 'Pending Review',
    submittedAt: '2025-03-01',
    completedTasks: 12,
    totalEarnings: 8450,
    successRate: 95,
    qualityScore: 92,
  },
  {
    id: '2',
    builderId: 'user2',
    builderName: 'Emily Zhang',
    builderEmail: 'builder2@example.com',
    builderAvatar: 'EZ',
    taskId: '4',
    taskTitle: 'Blockchain Workshop Series',
    taskLocation: 'Online',
    taskDate: '2025-03-05',
    taskBudget: 600,
    workSummary: 'Delivered comprehensive blockchain workshop series covering smart contracts...',
    kpiResults: [
      { name: 'Workshop Attendance', target: '100', achieved: '142', status: 'Achieved' },
      { name: 'Participant Satisfaction', target: '80%', achieved: '88%', status: 'Achieved' },
    ],
    supportingFiles: [
      { id: '7', name: 'workshop-recording-1.mp4', size: '512 MB', type: 'video/mp4', url: '#' },
      { id: '8', name: 'workshop-recording-2.mp4', size: '485 MB', type: 'video/mp4', url: '#' },
      { id: '9', name: 'event-photos-1.jpg', size: '3.5 MB', type: 'image/jpeg', url: '#' },
      { id: '10', name: 'feedback-summary.pdf', size: '890 KB', type: 'application/pdf', url: '#' },
      { id: '11', name: 'code-examples.zip', size: '12.4 MB', type: 'application/zip', url: '#' },
      {
        id: '12',
        name: 'attendee-list.xlsx',
        size: '156 KB',
        type: 'application/vnd.ms-excel',
        url: '#',
      },
    ],
    status: 'Pending Review',
    submittedAt: '2025-03-07',
    completedTasks: 8,
    totalEarnings: 5200,
    successRate: 88,
    qualityScore: 85,
  },
  {
    id: '3',
    builderId: 'user3',
    builderName: 'Alex Kim',
    builderEmail: 'builder3@example.com',
    builderAvatar: 'AK',
    taskId: '5',
    taskTitle: 'Smart Contract Workshop',
    taskLocation: 'Boston, MA',
    taskDate: '2025-01-15',
    taskBudget: 500,
    workSummary: 'Conducted hands-on smart contract development workshop...',
    kpiResults: [
      { name: 'Attendees', target: '40+', achieved: '52', status: 'Achieved' },
      { name: 'Code Quality', target: 'Good', achieved: 'Excellent', status: 'Achieved' },
    ],
    supportingFiles: [
      { id: '13', name: 'event-photos-1.jpg', size: '2.1 MB', type: 'image/jpeg', url: '#' },
      { id: '14', name: 'event-photos-2.jpg', size: '1.9 MB', type: 'image/jpeg', url: '#' },
      { id: '15', name: 'workshop-slides.pdf', size: '4.8 MB', type: 'application/pdf', url: '#' },
      {
        id: '16',
        name: 'participant-feedback.pdf',
        size: '680 KB',
        type: 'application/pdf',
        url: '#',
      },
      { id: '17', name: 'code-samples.zip', size: '8.5 MB', type: 'application/zip', url: '#' },
      { id: '18', name: 'attendance-sheet.pdf', size: '245 KB', type: 'application/pdf', url: '#' },
    ],
    status: 'Approved',
    submittedAt: '2025-01-17',
    reviewedAt: '2025-01-20',
    paymentAmount: 500,
    completedTasks: 15,
    totalEarnings: 9800,
    successRate: 100,
    qualityScore: 95,
  },
];

const statusColors = {
  'Pending Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  'Revision Requested': 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function SubmissionsPage() {
  const [activeTab, setActiveTab] = useState<'Pending Review' | 'Reviewed'>('Pending Review');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingSubmissions = mockSubmissions.filter((sub) => sub.status === 'Pending Review');
  const reviewedSubmissions = mockSubmissions.filter((sub) => sub.status !== 'Pending Review');

  const currentSubmissions =
    activeTab === 'Pending Review' ? pendingSubmissions : reviewedSubmissions;

  const filteredSubmissions = currentSubmissions.filter(
    (sub) =>
      sub.builderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.builderEmail.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
        <p className="text-gray-500 mt-1">Review task submissions and deliverables</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('Pending Review')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
            activeTab === 'Pending Review' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Review ({pendingSubmissions.length})
          {activeTab === 'Pending Review' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('Reviewed')}
          className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
            activeTab === 'Reviewed' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Reviewed ({reviewedSubmissions.length})
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
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center text-gray-400">
            {searchQuery
              ? 'No submissions found matching your search'
              : `No ${activeTab.toLowerCase()} submissions`}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission, index) => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                {/* Left Section */}
                <div className="flex items-start space-x-4 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">{submission.builderAvatar}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{submission.builderName}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          statusColors[submission.status]
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{submission.builderEmail}</p>

                    {/* Task Info */}
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Task:</p>
                      <p className="text-base font-medium text-gray-900">{submission.taskTitle}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{submission.taskLocation}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(submission.taskDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <File className="w-4 h-4" />
                          <span>{submission.supportingFiles.length} files</span>
                        </span>
                      </div>
                    </div>

                    {/* Submitted Date */}
                    <p className="text-xs text-gray-500">
                      Submitted{' '}
                      {submission.status === 'Pending Review' ? '1 day ago' : '3 days ago'}
                    </p>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <span className="text-lg font-bold text-green-600">${submission.taskBudget}</span>
                  {submission.status === 'Pending Review' ? (
                    <Link href={`/admin/submissions/${submission.id}`}>
                      <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-md transition-all">
                        Review Submission
                      </button>
                    </Link>
                  ) : (
                    <Link href={`/admin/submissions/${submission.id}`}>
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
