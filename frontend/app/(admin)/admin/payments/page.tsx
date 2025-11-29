'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, CheckCircle2, Loader2, ExternalLink, Hash } from 'lucide-react';
import Link from 'next/link';

interface Payment {
  id: string;
  streamId: string;
  amount: number;
  token: string;
  from: string;
  to: string;
  txHash: string | null;
  status: string;
  createdAt: string;
  builder: {
    name: string | null;
    email: string;
  } | null;
}

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payments');
        if (response.ok) {
          const data = await response.json();
          setPayments(data);
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
    const builderName = payment.builder?.name || payment.builder?.email || 'Unknown';
    const matchesSearch =
      builderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.streamId.includes(searchQuery);

    return matchesSearch;
  });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

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
        <p className="text-gray-500 mt-1">Track completed stream withdrawals and payments</p>
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
          placeholder="Search by builder or stream ID..."
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
            const builderName = payment.builder?.name || payment.builder?.email || 'Unknown Builder';
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
                      <p className="text-sm text-gray-500">{payment.builder?.email || payment.to}</p>

                      {/* Stream Info */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                           <Hash className="w-4 h-4" />
                           <span className="font-mono">Stream #{payment.streamId}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            Date: {new Date(payment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {payment.txHash && (
                            <div className="text-xs text-blue-600 truncate max-w-xs">
                                Tx: {payment.txHash}
                            </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Status & Amount */}
                  <div className="flex flex-col items-end space-y-3 ml-4">
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{payment.status}</span>
                    </span>
                    <p className="text-2xl font-bold text-gray-900">{payment.amount} {payment.token === 'XLM' ? 'XLM' : 'Token'}</p>
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
