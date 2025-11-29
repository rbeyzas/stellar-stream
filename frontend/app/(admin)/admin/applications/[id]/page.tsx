'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, DollarSign, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/applications/${id}`);
        if (res.ok) {
          const data = await res.json();
          setApplication(data);
          setReviewNotes(data.reviewNotes || '');
        }
      } catch (e) {
        console.error('Error loading application', e);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!application) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reviewNotes: reviewNotes.trim() || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setApplication(data);
        toast.success(`Application ${newStatus.toLowerCase()} successfully!`);
        router.push('/admin/applications');
      } else {
        toast.error('Failed to update application status');
      }
    } catch (e) {
      console.error('Error updating application', e);
      toast.error('Failed to update application status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.split(' ');
      return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2);
    }
    return email.slice(0, 2);
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
        <Link href="/admin/applications" className="inline-block mt-4">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border hover:bg-gray-200">
            Back to Applications
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
          <Link href="/admin/applications">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application Review</h1>
            <p className="text-gray-500 mt-1">Review builder application details</p>
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

      {/* Builder Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Builder Information</h2>
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xl uppercase">
              {getInitials(application.builder.name, application.builder.email)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {application.builder.name || 'No name provided'}
            </h3>
            <p className="text-sm text-gray-600">{application.builder.email}</p>
            <p className="text-xs text-gray-500 mt-2">
              Applied{' '}
              {new Date(application.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Cover Letter</h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {application.coverLetter}
        </p>
      </motion.div>

      {/* Review Notes (if already reviewed) */}
      {application.reviewNotes && application.status !== 'Pending' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 rounded-xl border border-gray-200 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2">Review Notes</h2>
          <p className="text-sm text-gray-600 mb-4">
            Reviewed{' '}
            {application.reviewedAt &&
              new Date(application.reviewedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
          </p>
          <p className="text-gray-700 whitespace-pre-wrap">{application.reviewNotes}</p>
        </motion.div>
      )}

      {/* Review Actions (only for Pending) */}
      {application.status === 'Pending' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Review Decision</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-900 mb-2">
                Review Notes (Optional)
              </label>
              <textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                disabled={isSubmitting}
                placeholder="Add any feedback or notes about this application..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => handleUpdateStatus('Rejected')}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <X className="w-5 h-5" />
                <span>Reject Application</span>
              </button>
              <button
                onClick={() => handleUpdateStatus('Approved')}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Approve Application</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
