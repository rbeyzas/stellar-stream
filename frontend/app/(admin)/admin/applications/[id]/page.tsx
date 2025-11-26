'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Mail,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Application, ApplicantProfile } from '@/types/application';

// Mock data
const mockApplication: Application = {
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
  coverLetter: `I am excited to apply for the Ethereum Workshop at Stanford. With over 3 years of experience in blockchain education and having successfully delivered 12 workshops, I am confident in my ability to engage computer science students and meet all KPIs.

My approach includes:
- Interactive coding sessions with live demonstrations
- Hands-on exercises using Remix and Hardhat
- Q&A sessions to address student questions
- Social media promotion before and after the event

I have strong connections with the Stanford blockchain community and can ensure excellent attendance. My previous workshops have averaged 40+ attendees with social media reach exceeding 8,000 impressions.`,
  status: 'Pending',
  appliedAt: '2024-11-25',
};

const mockProfile: ApplicantProfile = {
  id: 'user1',
  name: 'Marcus Rodriguez',
  email: 'ambassador1@example.com',
  avatar: 'MR',
  memberSince: 'Jan 2024',
  completedTasks: 12,
  totalEarnings: 8450,
  bio: 'Blockchain educator and community builder with 3+ years of experience in Web3.',
  skills: ['Ethereum', 'Smart Contracts', 'Public Speaking', 'Community Building'],
};

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  'Under Review': 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function ApplicationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: Fetch application data from API
  const application = mockApplication;
  const profile = mockProfile;

  const handleApprove = async () => {
    setIsSubmitting(true);
    // TODO: API call to approve application
    console.log('Approving application:', id, reviewNotes);
    setTimeout(() => {
      router.push('/admin/applications');
    }, 1000);
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this application?')) return;
    setIsSubmitting(true);
    // TODO: API call to reject application
    console.log('Rejecting application:', id, reviewNotes);
    setTimeout(() => {
      router.push('/admin/applications');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/applications">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Application Review</h1>
          <p className="text-gray-500 mt-1">
            Submitted on{' '}
            {new Date(application.appliedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
            statusColors[application.status]
          }`}
        >
          {application.status} Review
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Task Details</h2>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{application.taskTitle}</h3>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{application.taskLocation}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(application.taskDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </span>
                <span className="flex items-center space-x-2 font-semibold text-green-600">
                  <DollarSign className="w-4 h-4" />
                  <span>${application.taskBudget}</span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* Cover Letter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cover Letter</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {application.coverLetter}
              </p>
            </div>
          </motion.div>

          {/* Review Decision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Review Decision</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  placeholder="Add any notes about your decision..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>{isSubmitting ? 'Processing...' : 'Approve Application'}</span>
                </button>
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-5 h-5" />
                  <span>{isSubmitting ? 'Processing...' : 'Reject Application'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-6">
          {/* Builder Profile */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Builder Profile</h2>

            {/* Avatar and Name */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-2xl">{profile.avatar}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{profile.name}</h3>
              <p className="text-sm text-gray-500 flex items-center justify-center space-x-1 mt-1">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </p>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-semibold text-gray-900">{profile.memberSince}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Completed Tasks</span>
                <span className="text-sm font-semibold text-gray-900">
                  {profile.completedTasks}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Total Earnings</span>
                <span className="text-sm font-semibold text-green-600">
                  ${profile.totalEarnings.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Bio</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>

            {/* View Full Profile Button */}
            <Link href={`/admin/builders/${profile.id}`}>
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <User className="w-4 h-4" />
                <span>View Full Profile</span>
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
