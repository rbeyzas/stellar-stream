'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, Loader2 } from 'lucide-react';

interface PaymentHistoryItem {
  id: string;
  taskTitle: string;
  date: string;
  amount: number;
  status: string;
}

interface Submission {
  id: string;
  status: string;
  amount: number | null;
  createdAt: string;
  updatedAt: string;
  task: {
    title: string;
  };
}

export default function EarningsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/submissions?builderEmail=${userEmail}`);
        if (response.ok) {
          const submissions: Submission[] = await response.json();
          
          // Filter for approved/paid submissions
          const paidSubmissions = submissions.filter(
            (s) => s.status === 'Approved' && s.amount !== null
          );

          const history: PaymentHistoryItem[] = paidSubmissions.map((s) => ({
            id: s.id,
            taskTitle: s.task.title,
            date: s.updatedAt, // Use updatedAt as payment date
            amount: s.amount || 0,
            status: 'Paid',
          }));

          setPaymentHistory(history);
          setTotalEarnings(history.reduce((sum, item) => sum + item.amount, 0));
          setCompletedTasks(history.length);
        }
      } catch (error) {
        console.error('Error fetching earnings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-500 mt-1">Track your payments and financial performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <p className="text-3xl font-bold text-gray-900">{totalEarnings.toLocaleString()} XLM</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </motion.div>

        {/* Completed Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Payment History</h2>

        {paymentHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payments received yet.
          </div>
        ) : (
          <div className="space-y-3">
            {paymentHistory.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{payment.taskTitle}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(payment.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xl font-bold text-gray-900">{payment.amount} XLM</span>
                  <span className="px-3 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                    {payment.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
