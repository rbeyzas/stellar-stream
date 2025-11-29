'use client';

import { use, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import { Task } from '@/types/task';
import { useRouter } from 'next/navigation';
import StreamFundingModal from '@/components/StreamFundingModal';

const statusColors = {
  Open: 'bg-green-100 text-green-800 border-green-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  Completed: 'bg-gray-100 text-gray-800 border-gray-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
  'Pending Stream Start': 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const typeColors: Record<string, string> = {
  Workshop: 'bg-purple-50 text-purple-700 border-purple-200',
  Hackathon: 'bg-blue-50 text-blue-700 border-blue-200',
  Meetup: 'bg-pink-50 text-pink-700 border-pink-200',
  Conference: 'bg-orange-50 text-orange-700 border-orange-200',
  'Part-time Job': 'bg-green-50 text-green-700 border-green-200',
  'Full-time Job': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Hourly Job': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Other: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function ViewTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [adminWallet, setAdminWallet] = useState('');

  useEffect(() => {
    const wallet = localStorage.getItem('walletAddress');
    if (wallet) setAdminWallet(wallet);
  }, []);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`/api/tasks/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTask(data);
        }
      } catch (e) {
        console.error('Error fetching task', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          router.push('/admin/tasks');
        }
      } catch (e) {
        console.error('Error deleting task', e);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Task not found</p>
        <Link href="/admin/tasks" className="inline-block mt-4">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border hover:bg-gray-200">
            Back to Tasks
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
          <Link href="/admin/tasks">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Details</h1>
            <p className="text-gray-500 mt-1">View and manage task information</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {task.status === 'Pending Stream Start' && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg animate-pulse"
            >
              <DollarSign className="w-5 h-5" />
              <span>Approve & Fund Stream</span>
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete</span>
          </button>
          <Link href={`/admin/tasks/${task.id}/edit`}>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
              <Edit className="w-5 h-5" />
              <span>Edit Task</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Task Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {/* Header Section */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  typeColors[task.type]
                }`}
              >
                {task.type}
              </span>
              <span
                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                  statusColors[task.status as keyof typeof statusColors] || statusColors.Open
                }`}
              >
                {task.status}
              </span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h2>
          <p className="text-gray-600">{task.description}</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-gray-50">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Location</p>
              <p className="text-gray-900 font-semibold mt-1">{task.location}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Date</p>
              <p className="text-gray-900 font-semibold mt-1">
                {task.date
                  ? new Date(task.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Not specified'}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Budget</p>
              <p className="text-gray-900 font-semibold mt-1">${task.budget}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Applicants</p>
              <p className="text-gray-900 font-semibold mt-1">
                {task.currentApplicants} / {task.maxApplicants}
              </p>
            </div>
          </div>
        </div>

        {/* KPIs Section */}
        {task.kpis && task.kpis.length > 0 && (
          <div className="p-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Key Performance Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {task.kpis.map((kpi, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200"
                >
                  <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">{kpi.name}</p>
                    <p className="text-sm text-gray-600">Target: {kpi.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Section */}
        <div className="p-8 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                Created:{' '}
                {new Date(task.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                Last updated:{' '}
                {new Date(task.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Applicants Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Applicants</h3>
        {task.applications && task.applications.length > 0 ? (
          <div className="space-y-4">
            {task.applications.map((application) => (
              <div
                key={application.id}
                className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {application.builderName
                          ? application.builderName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                          : application.builderEmail[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {application.builderName || 'Anonymous Builder'}
                      </p>
                      <p className="text-sm text-gray-500">{application.builderEmail}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 ml-13 line-clamp-2">
                    {application.coverLetter}
                  </p>
                </div>
                <div className="ml-4 flex flex-col items-end space-y-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      application.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : application.status === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                  <p className="text-xs text-gray-400">
                    {new Date(application.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No applicants yet</p>
          </div>
        )}
      </div>
      
      {/* Stream Funding Modal */}
      <StreamFundingModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        task={task}
        adminWallet={adminWallet}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          // Refresh task data
          fetch(`/api/tasks/${id}`)
            .then((res) => res.json())
            .then((data) => setTask(data));
        }}
      />
    </div>
  );
}
