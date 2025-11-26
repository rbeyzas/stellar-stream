'use client';

import { motion } from 'framer-motion';
import { Wallet as WalletIcon, Send, ArrowDownToLine } from 'lucide-react';

export default function WalletPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-500 mt-1">Manage your crypto wallet</p>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-3 mb-6">
          <WalletIcon className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Your Wallet</h2>
        </div>
        <div className="mb-6">
          <p className="text-sm text-white/70 mb-2">Total Balance</p>
          <p className="text-4xl font-bold">0.00 XLM</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm">
            <Send className="w-5 h-5" />
            <span>Send</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm">
            <ArrowDownToLine className="w-5 h-5" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
        <div className="flex items-center justify-center h-96 text-gray-400">
          No transactions yet
        </div>
      </div>
    </div>
  );
}
