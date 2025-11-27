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
  Download,
  FileText,
  Image,
  Film,
  FileSpreadsheet,
  Archive,
  Award,
  TrendingUp,
  Briefcase,
} from 'lucide-react';
import { Submission } from '@/types/submission';

// Mock data
const mockSubmission: Submission = {
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
  workSummary: `Successfully organized and hosted the Web3 Community Meetup in Austin with excellent turnout and engagement. The event featured three technical presentations on DeFi protocols, NFT marketplaces, and Layer 2 scaling solutions.

Key Highlights:
- Reached 65 attendees (30% above target)
- Partnered with local Web3 companies for sponsorships
- Facilitated 8 networking sessions between attendees
- Live-streamed the event reaching 95+ online participants
- Collected feedback from 50+ attendees with 88% satisfaction rate

I have strong connections with the Stanford blockchain community and can ensure excellent attendance. My previous workshops have averaged 40+ attendees with social media reach exceeding 8,000 impressions.`,
  kpiResults: [
    { name: 'Attendees', target: '50+', achieved: '65', status: 'Achieved' },
    { name: 'New Community Members', target: '20', achieved: '28', status: 'Achieved' },
  ],
  supportingFiles: [
    { id: '1', name: 'event-photos-1.jpg', size: '2.3 MB', type: 'image/jpeg', url: '#' },
    { id: '2', name: 'event-photos-2.jpg', size: '1.8 MB', type: 'image/jpeg', url: '#' },
    { id: '3', name: 'presentation-slides.pdf', size: '5.2 MB', type: 'application/pdf', url: '#' },
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
};

const statusColors = {
  'Pending Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  'Revision Requested': 'bg-blue-100 text-blue-800 border-blue-200',
};

const kpiStatusColors = {
  Achieved: 'bg-green-100 text-green-800',
  'Not Achieved': 'bg-red-100 text-red-800',
  'Partially Achieved': 'bg-yellow-100 text-yellow-800',
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  if (type.includes('pdf')) return FileText;
  if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet;
  if (type.includes('zip')) return Archive;
  return FileText;
};

export default function SubmissionReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [reviewNotes, setReviewNotes] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(mockSubmission.taskBudget.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submission = mockSubmission;

  const handleApprove = async () => {
    setIsSubmitting(true);
    console.log('Approving submission:', id, { reviewNotes, paymentAmount });
    setTimeout(() => {
      router.push('/admin/submissions');
    }, 1000);
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this submission?')) return;
    setIsSubmitting(true);
    console.log('Rejecting submission:', id, reviewNotes);
    setTimeout(() => {
      router.push('/admin/submissions');
    }, 1000);
  };

  const handleRequestRevision = async () => {
    if (!reviewNotes.trim()) {
      alert('Please provide feedback for revision');
      return;
    }
    setIsSubmitting(true);
    console.log('Requesting revision:', id, reviewNotes);
    setTimeout(() => {
      router.push('/admin/submissions');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/submissions">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Submission Review</h1>
          <p className="text-gray-500 mt-1">
            Submitted on{' '}
            {new Date(submission.submittedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
            statusColors[submission.status]
          }`}
        >
          {submission.status}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{submission.taskTitle}</h3>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{submission.taskLocation}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(submission.taskDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </span>
                <span className="flex items-center space-x-2 font-semibold text-green-600">
                  <DollarSign className="w-4 h-4" />
                  <span>${submission.taskBudget}</span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* Work Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Work Summary</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {submission.workSummary}
              </p>
            </div>
          </motion.div>

          {/* KPI Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">KPI Results</h2>
            <div className="space-y-3">
              {submission.kpiResults.map((kpi, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{kpi.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Target: {kpi.target}</span>
                      <span>•</span>
                      <span className="font-medium text-gray-900">Achieved: {kpi.achieved}</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      kpiStatusColors[kpi.status]
                    }`}
                  >
                    {kpi.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Supporting Files */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Supporting Files ({submission.supportingFiles.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {submission.supportingFiles.map((file) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Review & Payment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Review & Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Task budget: ${submission.taskBudget}</p>
              </div>

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
                  <span>{isSubmitting ? 'Processing...' : 'Approve & Process Payment'}</span>
                </button>
                <button
                  onClick={handleRequestRevision}
                  disabled={isSubmitting}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Revisions
                </button>
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Reject</span>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Builder</h2>

            {/* Avatar and Name */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-2xl">{submission.builderAvatar}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{submission.builderName}</h3>
              <p className="text-sm text-gray-500 flex items-center justify-center space-x-1 mt-1">
                <Mail className="w-4 h-4" />
                <span>{submission.builderEmail}</span>
              </p>
            </div>

            {/* Performance Summary */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Performance Summary</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600 flex items-center space-x-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Completed Tasks</span>
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {submission.completedTasks}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Total Earnings</span>
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    ${submission.totalEarnings.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Success Rate</span>
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {submission.successRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600 flex items-center space-x-2">
                    <Award className="w-4 h-4" />
                    <span>Quality Score</span>
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {submission.qualityScore}/100
                  </span>
                </div>
              </div>
            </div>

            {/* View Full Profile Button */}
            <Link href={`/admin/builders/${submission.builderId}`}>
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
