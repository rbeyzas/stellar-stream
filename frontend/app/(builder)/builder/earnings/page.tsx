'use client';

import { DollarSign, TrendingUp, Download } from 'lucide-react';

export default function EarningsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-500 mt-1">Track your earnings and withdrawals</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
          <Download className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Earnings</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">0 XLM</p>
          <p className="text-sm text-gray-500 mt-2">All-time earnings</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">This Month</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">0 XLM</p>
          <p className="text-sm text-gray-500 mt-2">Monthly earnings</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
          </div>
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
