'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, User } from 'lucide-react';

interface Application {
  id: string;
  coverLetter: string;
  status: string;
  createdAt: string;
  reviewNotes: string | null;
  reviewedAt: string | null;
  task: {
    id: string;
    title: string;
    type: string;
    location: string | null;
    date: string | null;
    budget: number | null;
  };
  builder: {
    id: string;
    email: string;
    name: string | null;
  };
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/applications');
        if (res.ok) {
          const data = await res.json();
          setApplications(data);
        }
      } catch (e) {
        console.error('Error loading applications', e);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.builder.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.builder.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.task.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.split(' ');
      return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2);
    }
    return email.slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-500 mt-1">Review and manage builder applications</p>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center text-gray-400">
            {searchTerm || statusFilter !== 'All'
              ? 'No applications found matching your filters'
              : 'No applications yet'}
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
                    <span className="text-white font-bold text-lg uppercase">
                      {getInitials(application.builder.name, application.builder.email)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {application.builder.name || application.builder.email}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          statusColors[application.status as keyof typeof statusColors]
                        }`}
                      >
                        {application.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{application.builder.email}</p>

                    {/* Applied For */}
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Applied for:</p>
                      <p className="text-base font-medium text-gray-900">
                        {application.task.title}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        {application.task.location && (
                          <span className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{application.task.location}</span>
                          </span>
                        )}
                        {application.task.date && (
                          <span>
                            {new Date(application.task.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                        {application.task.budget && (
                          <span className="font-semibold text-green-600">
                            ${application.task.budget}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Applied Date */}
                    <p className="text-xs text-gray-500">
                      {application.status === 'Pending' ? 'Applied' : 'Reviewed'}{' '}
                      {formatDate(application.createdAt)}
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
