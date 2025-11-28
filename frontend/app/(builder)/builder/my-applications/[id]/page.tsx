'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
    description: string | null;
  };
  builder: {
    id: string;
    email: string;
    name: string | null;
  };
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/applications/${id}`);
        if (res.ok) {
          const data = await res.json();
          setApplication(data);
        }
      } catch (e) {
        console.error('Error loading application', e);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Application not found</p>
        <Link href="/builder/my-applications" className="inline-block mt-4">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border hover:bg-gray-200">
            Back to My Applications
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/builder/my-applications">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application Review</h1>
            <p className="text-gray-500 mt-1">View your application details and status</p>
          </div>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold border ${
            statusColors[application.status as keyof typeof statusColors]
          }`}
        >
          {application.status}
        </span>
      </div>

      {/* Application Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-800 font-medium">Application Submitted</p>
            <p className="text-lg font-bold text-purple-900">
              {new Date(application.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          {application.reviewedAt && (
            <div className="text-right">
              <p className="text-sm text-purple-800 font-medium">Reviewed On</p>
              <p className="text-lg font-bold text-purple-900">
                {new Date(application.reviewedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Task Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Task Details</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{application.task.title}</h3>
            <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
              {application.task.type}
            </span>
          </div>

          {application.task.description && (
            <p className="text-gray-700">{application.task.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {application.task.location && (
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span className="text-sm">{application.task.location}</span>
              </div>
            )}
            {application.task.date && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">
                  {new Date(application.task.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
            {application.task.budget && (
              <div className="flex items-center space-x-2 text-green-600 font-semibold">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm">${application.task.budget}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Cover Letter Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Cover Letter</h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {application.coverLetter}
        </p>
      </motion.div>

      {/* Admin Feedback (if reviewed) */}
      {application.reviewNotes && application.status !== 'Pending' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-xl border p-6 ${
            application.status === 'Approved'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Feedback</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{application.reviewNotes}</p>
        </motion.div>
      )}

      {/* Status Message */}
      {application.status === 'Pending' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
        >
          <p className="text-yellow-800 font-medium">
            Your application is pending review. You&apos;ll be notified once a decision is made.
          </p>
        </motion.div>
      )}

      {application.status === 'Approved' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-green-50 border border-green-200 rounded-xl p-6"
        >
          <p className="text-green-800 font-medium">
            Congratulations! Your application has been approved. Check your email for next steps.
          </p>
        </motion.div>
      )}

      {application.status === 'Rejected' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6"
        >
          <p className="text-red-800 font-medium">
            Unfortunately, your application was not selected for this task. Keep browsing for more
            opportunities!
          </p>
          <Link href="/builder/tasks" className="inline-block mt-4">
            <button className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all">
              Browse More Tasks
            </button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
