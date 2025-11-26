'use client';

import { Share2, Copy } from 'lucide-react';

export default function ReferralsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referrals</h1>
          <p className="text-gray-500 mt-1">Manage your referral network</p>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Share2 className="w-6 h-6" />
          <h2 className="text-xl font-bold">Your Referral Link</h2>
        </div>
        <div className="flex items-center space-x-3 bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <input
            type="text"
            value="https://stellar-stream.app/ref/YOUR_CODE"
            readOnly
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/70"
          />
          <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <Copy className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm mt-4 text-white/80">
          Share this link to earn rewards for every successful referral
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-medium">Total Referrals</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-medium">Active Referrals</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-medium">Earnings from Referrals</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">0 XLM</p>
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Referrals</h2>
        <div className="flex items-center justify-center h-64 text-gray-400">
          No referrals yet. Start sharing your link!
        </div>
      </div>
    </div>
  );
}
