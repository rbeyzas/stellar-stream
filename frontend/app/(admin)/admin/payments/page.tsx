'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Payment } from '@/types/payment';

// Mock data
const mockPayments: Payment[] = [
  {
    id: '1',
    builderId: 'user1',
    builderName: 'Marcus Rodriguez',
    builderEmail: 'ambassador1@example.com',
    builderAvatar: 'MR',
    submissionId: '1',
    taskId: '3',
    taskTitle: 'Web3 Community Meetup',
    taskDate: '2025-02-28',
    amount: 300,
    status: 'Pending Approval',
    submittedAt: '2025-03-01',
  },
  {
    id: '2',
    builderId: 'user2',
    builderName: 'Emily Zhang',
    builderEmail: 'ambassador2@example.com',
    builderAvatar: 'EZ',
    submissionId: '2',
    taskId: '4',
    taskTitle: 'Blockchain Workshop Series',
    taskDate: '2025-03-15',
    amount: 600,
    status: 'Pending Approval',
    submittedAt: '2025-03-18',
  },
  {
    id: '3',
    builderId: 'user3',
    builderName: 'Alex Kim',
    builderEmail: 'ambassador3@example.com',
    builderAvatar: 'AK',
    submissionId: '3',
    taskId: '5',
    taskTitle: 'DeFi Hackathon Mentorship',
    taskDate: '2025-02-20',
    amount: 1200,
    status: 'Processing',
    submittedAt: '2025-02-22',
    approvedAt: '2025-02-22',
  },
  {
    id: '4',
    builderId: 'user4',
    builderName: 'Jordan Lee',
    builderEmail: 'ambassador4@example.com',
    builderAvatar: 'JL',
    submissionId: '4',
    taskId: '6',
    taskTitle: 'Smart Contract Workshop',
    taskDate: '2025-01-15',
    amount: 500,
    status: 'Completed',
    submittedAt: '2025-01-16',
    approvedAt: '2025-01-17',
    paidAt: '2025-01-18',
    transactionHash: '0xabcd...5678',
  },
  {
    id: '5',
    builderId: 'user1',
    builderName: 'Marcus Rodriguez',
    builderEmail: 'ambassador1@example.com',
    builderAvatar: 'MR',
    submissionId: '5',
    taskId: '7',
    taskTitle: 'Web3 Hackathon Mentorship',
    taskDate: '2025-01-08',
    amount: 800,
    status: 'Completed',
    submittedAt: '2025-01-09',
    approvedAt: '2025-01-09',
    paidAt: '2025-01-10',
    transactionHash: '0xabcd...ef0h',
  },
];

const statusConfig = {
  'Pending Approval': {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  Processing: {
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    icon: Clock,
  },
  Completed: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
  },
  Failed: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle,
  },
};

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'processing' | 'completed'>('pending');

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch =
      payment.builderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.taskTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      (activeTab === 'pending' && payment.status === 'Pending Approval') ||
      (activeTab === 'processing' && payment.status === 'Processing') ||
      (activeTab === 'completed' && payment.status === 'Completed');

    return matchesSearch && matchesTab;
  });

  const totalPending = mockPayments.reduce(
    (sum, p) => (p.status === 'Pending Approval' ? sum + p.amount : sum),
    0,
  );

  const pendingCount = mockPayments.filter((p) => p.status === 'Pending Approval').length;
  const processingCount = mockPayments.filter((p) => p.status === 'Processing').length;
  const completedCount = mockPayments.filter((p) => p.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">Manage and track ambassador payments</p>
      </div>

      {/* Total Pending Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Total Pending</p>
            <p className="text-4xl font-bold mt-1">${totalPending.toLocaleString()}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search payments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending ({pendingCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('processing')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'processing'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Processing ({processingCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed ({completedCount})</span>
        </button>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No payments found</p>
          </div>
        ) : (
          filteredPayments.map((payment, index) => {
            const StatusIcon = statusConfig[payment.status].icon;
            return (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  {/* Left Side - Builder Info */}
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{payment.builderAvatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">{payment.builderName}</h3>
                      <p className="text-sm text-gray-500">{payment.builderEmail}</p>

                      {/* Task Info */}
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          Task: {payment.taskTitle}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Event: {new Date(payment.taskDate).toLocaleDateString()}</span>
                          </span>
                          <span>
                            Submitted: {new Date(payment.submittedAt).toLocaleDateString()}
                          </span>
                          {payment.paidAt && (
                            <span>Paid: {new Date(payment.paidAt).toLocaleDateString()}</span>
                          )}
                        </div>
                        {payment.transactionHash && (
                          <p className="text-xs text-gray-500 font-mono">
                            TX: {payment.transactionHash}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Status & Amount */}
                  <div className="flex flex-col items-end space-y-3 ml-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                        statusConfig[payment.status].color
                      }`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      <span>{payment.status}</span>
                    </span>
                    <p className="text-2xl font-bold text-gray-900">${payment.amount}</p>
                    {payment.status === 'Pending Approval' && (
                      <Link href={`/admin/submissions/${payment.submissionId}`}>
                        <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                          Review Submission
                        </button>
                      </Link>
                    )}
                    {payment.status === 'Completed' && (
                      <span className="text-xs text-green-600 font-medium">Paid</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
