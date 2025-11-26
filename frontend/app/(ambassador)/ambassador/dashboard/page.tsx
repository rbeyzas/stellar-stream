'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, Award } from 'lucide-react';

export default function AmbassadorDashboard() {
  const stats = [
    {
      title: 'Total Earnings',
      value: '0 XLM',
      change: '+0%',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Active Campaigns',
      value: '0',
      change: '+0%',
      icon: Award,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Total Referrals',
      value: '0',
      change: '+0%',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Performance Score',
      value: '0%',
      change: '+0%',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ambassador Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here&apos;s your overview.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="flex items-center justify-center h-64 text-gray-400">No activity yet</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Campaigns</h2>
          <div className="flex items-center justify-center h-64 text-gray-400">
            No campaigns yet
          </div>
        </div>
      </div>
    </div>
  );
}
