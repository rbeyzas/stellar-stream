'use client';

import { use, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Download,
  FileText,
  Image,
  Film,
  FileSpreadsheet,
  Archive,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

interface Builder {
  id: string;
  name: string | null;
  email: string;
  walletAddress: string | null;
}

interface Task {
  id: string;
  title: string;
  location: string | null;
  date: Date;
  budget: number;
}

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
  workSummary: string;
  status: string;
  reviewNotes: string | null;
  amount: number | null;
  createdAt: Date;
  builder: Builder;
  task: Task;
  kpiResults: KPIResult[];
  supportingFiles: SupportingFile[];
}

const statusColors: Record<string, string> = {
  'Pending Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  'Revision Requested': 'bg-blue-100 text-blue-800 border-blue-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
};

const kpiStatusColors: Record<string, string> = {
  Achieved: 'bg-green-100 text-green-800',
  'Not Achieved': 'bg-red-100 text-red-800',
  'Partially Achieved': 'bg-yellow-100 text-yellow-800',
  Pending: 'bg-gray-100 text-gray-800',
};

const formatFileSize = (size: string | number): string => {
  const bytes = typeof size === 'string' ? parseInt(size) : size;
  if (isNaN(bytes)) return size.toString();
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  if (type.includes('pdf')) return FileText;
  if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet;
  if (type.includes('zip')) return Archive;
  return FileText;
};

export default function BuilderSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await fetch(`/api/submissions/${id}`);
        if (response.ok) {
          const data = await response.json();
          setSubmission(data);
        }
      } catch (error) {
        console.error('Error fetching submission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Submission not found</p>
          <Link href="/builder/my-tasks">
            <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Back to My Tasks
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (submission.status) {
      case 'Approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/builder/my-tasks">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">My Submission</h1>
          <p className="text-gray-500 mt-1">
            Submitted on{' '}
            {new Date(submission.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-lg text-sm font-semibold border flex items-center space-x-2 ${
            statusColors[submission.status] || statusColors.draft
          }`}
        >
          {getStatusIcon()}
          <span>{submission.status}</span>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{submission.task.title}</h3>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{submission.task.location || 'Remote'}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(submission.task.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </span>
                <span className="flex items-center space-x-2 font-semibold text-green-600">
                  <DollarSign className="w-4 h-4" />
                  <span>${submission.task.budget}</span>
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
              {submission.kpiResults.map((kpi: KPIResult, index: number) => (
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
                      kpiStatusColors[kpi.status] || 'bg-gray-100 text-gray-800'
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
            {submission.supportingFiles.length === 0 ? (
              <p className="text-gray-500 text-sm">No files uploaded</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {submission.supportingFiles.map((file: SupportingFile) => {
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
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                      <a href={file.url} download target="_blank" rel="noopener noreferrer">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-6">
          {/* Status Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Status</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                <span
                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold border ${
                    statusColors[submission.status] || statusColors.draft
                  }`}
                >
                  {getStatusIcon()}
                  <span>{submission.status}</span>
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Submitted</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(submission.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {submission.amount && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Amount</p>
                  <p className="text-2xl font-bold text-green-600">${submission.amount}</p>
                </div>
              )}

              {submission.reviewNotes && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Admin Notes</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {submission.reviewNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <Link href="/builder/my-tasks">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to My Tasks</span>
                </button>
              </Link>
              <Link href={`/builder/tasks/${submission.task.id}`}>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>View Task Details</span>
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
