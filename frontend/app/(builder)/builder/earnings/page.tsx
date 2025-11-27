'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface PaymentHistoryItem {
  id: string;
  taskTitle: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending';
}

// Mock data
const paymentHistory: PaymentHistoryItem[] = [
  {
    id: '1',
    taskTitle: 'Smart Contract Workshop',
    date: '2025-01-20',
    amount: 500,
    status: 'Paid',
  },
  {
    id: '2',
    taskTitle: 'Web3 Hackathon Mentorship',
    date: '2025-01-12',
    amount: 800,
    status: 'Paid',
  },
  {
    id: '3',
    taskTitle: 'Blockchain Developer Meetup',
    date: '2024-12-28',
    amount: 400,
    status: 'Paid',
  },
  {
    id: '4',
    taskTitle: 'Web3 Community Meetup',
    date: 'Pending',
    amount: 300,
    status: 'Pending',
  },
  {
    id: '5',
    taskTitle: 'Blockchain Workshop Series',
    date: 'Pending',
    amount: 600,
    status: 'Pending',
  },
];

export default function EarningsPage() {
  const totalEarnings = 8450;
  const thisMonthEarnings = 500;
  const pendingEarnings = 900;
  const completedTasks = 12;

  const paidPayments = paymentHistory.filter((p) => p.status === 'Paid');
  const pendingPayments = paymentHistory.filter((p) => p.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-500 mt-1">Track your payments and financial performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Earnings</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalEarnings.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </motion.div>

        {/* This Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">This Month</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">${thisMonthEarnings}</p>
          <p className="text-sm text-green-600 mt-1">+12% from last month</p>
        </motion.div>

        {/* Pending */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Pending</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">${pendingEarnings}</p>
          <p className="text-sm text-gray-500 mt-1">{pendingPayments.length} payments</p>
        </motion.div>

        {/* Completed Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Completed Tasks</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{completedTasks}</p>
          <p className="text-sm text-gray-500 mt-1">Successfully delivered</p>
        </motion.div>
      </div>

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Payment History</h2>

        <div className="space-y-3">
          {paymentHistory.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{payment.taskTitle}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {payment.status === 'Paid'
                    ? new Date(payment.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : payment.date}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xl font-bold text-gray-900">${payment.amount}</span>
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    payment.status === 'Paid'
                      ? 'bg-red-500 text-red-900'
                      : 'bg-yellow-500 text-yellow-900'
                  }`}
                >
                  {payment.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
          <p className="text-3xl font-bold text-gray-900">0 XLM</p>
          <p className="text-sm text-gray-500 mt-2">Pending payout</p>
        </div>
      </div>

      {/* Earnings History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Earnings History</h2>
        <div className="flex items-center justify-center h-96 text-gray-400">No earnings yet</div>
      </div>
    </div>
  );
}
