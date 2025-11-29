'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, File, Loader2 } from 'lucide-react';

interface KPIResult {
  id: string;
  name: string;
  target: string;
  achieved: string;
  status: string;
}

interface SupportingFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

interface Submission {
  id: string;
  builderId: string;
  taskId: string;
  workSummary: string;
  status: string;
  createdAt: string;
  reviewedAt?: string;
  amount?: number;
  builder: {
    id: string;
    email: string;
    name: string | null;
  };
  task: {
    id: string;
    title: string;
    location: string | null;
    date: string | null;
    budget: number;
  };
  kpiResults: KPIResult[];
  supportingFiles: SupportingFile[];
}

const statusColors = {
  'Pending Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  'Revision Requested': 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function SubmissionsPage() {
  const [activeTab, setActiveTab] = useState<'Pending Review' | 'Reviewed'>('Pending Review');
  const [searchQuery, setSearchQuery] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/api/submissions');
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const pendingSubmissions = submissions.filter((sub) => sub.status === 'Pending Review');
  const reviewedSubmissions = submissions.filter(
    (sub) => sub.status !== 'Pending Review' && sub.status !== 'draft',
  );

  const currentSubmissions =
    activeTab === 'Pending Review' ? pendingSubmissions : reviewedSubmissions;

  const filteredSubmissions = currentSubmissions.filter(
    (sub) =>
      (sub.builder.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      sub.task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.builder.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

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
                    <span className="text-white font-bold text-lg">
                      {submission.builder.name
                        ? submission.builder.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                        : submission.builder.email[0].toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {submission.builder.name || 'Anonymous Builder'}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          statusColors[submission.status as keyof typeof statusColors] ||
                          statusColors['Pending Review']
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{submission.builder.email}</p>

                    {/* Task Info */}
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Task:</p>
                      <p className="text-base font-medium text-gray-900">{submission.task.title}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        {submission.task.location && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{submission.task.location}</span>
                          </span>
                        )}
                        {submission.task.date && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(submission.task.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </span>
                        )}
                        <span className="flex items-center space-x-1">
                          <File className="w-4 h-4" />
                          <span>{submission.supportingFiles.length} files</span>
                        </span>
                      </div>
                    </div>

                    {/* Submitted Date */}
                    <p className="text-xs text-gray-500">
                      Submitted{' '}
                      {new Date(submission.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <span className="text-lg font-bold text-green-600">
                    ${submission.task.budget.toLocaleString()}
                  </span>
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
