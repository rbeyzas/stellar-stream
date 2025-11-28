'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign } from 'lucide-react';

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

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      const builderEmail = localStorage.getItem('userEmail');
      if (!builderEmail) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/applications?builderEmail=${encodeURIComponent(builderEmail)}`,
        );
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 mt-1">Track the status of your task applications</p>
      </div>
      {/* Stats */}
      {applications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800 font-medium">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-900">
              {applications.filter((a) => a.status === 'Pending').length}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800 font-medium">Approved</p>
            <p className="text-2xl font-bold text-green-900">
              {applications.filter((a) => a.status === 'Approved').length}
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-800 font-medium">Rejected</p>
            <p className="text-2xl font-bold text-red-900">
              {applications.filter((a) => a.status === 'Rejected').length}
            </p>
          </div>
        </div>
      )}
      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">You haven&apos;t applied to any tasks yet</p>
          <Link href="/builder/tasks">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
              Browse Available Tasks
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application, index) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{application.task.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        statusColors[application.status as keyof typeof statusColors]
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>

                  <span className="inline-block mb-3 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                    {application.task.type}
                  </span>

                  <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                    {application.task.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{application.task.location}</span>
                      </div>
                    )}
                    {application.task.date && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(application.task.date)}</span>
                      </div>
                    )}
                    {application.task.budget && (
                      <div className="flex items-center space-x-1 text-green-600 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        <span>${application.task.budget}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    Applied on {formatDate(application.createdAt)}
                  </p>

                  {application.reviewNotes && application.status !== 'Pending' && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Admin Feedback:</p>
                      <p className="text-sm text-gray-600">{application.reviewNotes}</p>
                    </div>
                  )}
                </div>

                <Link href={`/builder/my-applications/${application.id}`}>
                  <button className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    View Details
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
