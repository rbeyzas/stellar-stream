'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Submission {
  id: string;
  status: string;
  amount: number | null;
  createdAt: string;
  updatedAt: string;
  task: {
    title: string;
    date: string;
  };
  builder: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [payments, setPayments] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/submissions');
        if (response.ok) {
          const submissions: Submission[] = await response.json();
          // Filter for approved submissions which represent completed payments
          const approvedSubmissions = submissions.filter(
            (s) => s.status === 'Approved' && s.amount !== null
          );
          setPayments(approvedSubmissions);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const builderName = payment.builder.name || payment.builder.email;
    const matchesSearch =
      builderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.task.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

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
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">Track completed payments to ambassadors</p>
      </div>

      {/* Total Paid Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Total Paid</p>
            <p className="text-4xl font-bold mt-1">{totalPaid.toLocaleString()} XLM</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by builder or task..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No payments found</p>
          </div>
        ) : (
          filteredPayments.map((payment, index) => {
            const builderName = payment.builder.name || payment.builder.email;
            const builderAvatar = builderName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2);

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
                      <span className="text-white font-bold">{builderAvatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">{builderName}</h3>
                      <p className="text-sm text-gray-500">{payment.builder.email}</p>

                      {/* Task Info */}
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          Task: {payment.task.title}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Event: {new Date(payment.task.date).toLocaleDateString()}</span>
                          </span>
                          <span>
                            Paid: {new Date(payment.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Status & Amount */}
                  <div className="flex flex-col items-end space-y-3 ml-4">
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Paid</span>
                    </span>
                    <p className="text-2xl font-bold text-gray-900">{payment.amount} XLM</p>
                    <Link href={`/admin/submissions/${payment.id}`}>
                      <button className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </Link>
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
