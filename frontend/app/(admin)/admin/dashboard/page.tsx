'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, TrendingUp, Activity, FileText, Clock, CheckCircle, AlertCircle, Briefcase, Award } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  overview: {
    totalBuilders: number;
    totalTasks: number;
    openTasks: number;
    inProgressTasks: number;
    totalApplications: number;
    pendingApplications: number;
    totalSubmissions: number;
    pendingSubmissions: number;
    totalBudget: number;
  };
  recentApplications: Array<{
    id: string;
    builderName: string;
    taskTitle: string;
    status: string;
    createdAt: string;
  }>;
  topBuilders: Array<{
    id: string;
    name: string;
    email: string;
    totalSubmissions: number;
    approvedSubmissions: number;
    totalApplications: number;
    approvedApplications: number;
  }>;
  tasksByType: Array<{
    type: string;
    count: number;
  }>;
  applicationsByStatus: Array<{
    status: string;
    count: number;
  }>;
}

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/analytics');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Builders',
      value: analytics?.overview.totalBuilders || 0,
      subtitle: `${analytics?.overview.totalApplications || 0} applications`,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Active Tasks',
      value: analytics?.overview.openTasks || 0,
      subtitle: `${analytics?.overview.inProgressTasks || 0} in progress`,
      icon: Activity,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Total Budget',
      value: `${analytics?.overview.totalBudget || 0} XLM`,
      subtitle: `${analytics?.overview.totalTasks || 0} total tasks`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Pending Reviews',
      value: analytics?.overview.pendingSubmissions || 0,
      subtitle: `${analytics?.overview.totalSubmissions || 0} total submissions`,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                  <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
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

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
            Tasks by Type
          </h2>
          <div className="space-y-3">
            {analytics?.tasksByType && analytics.tasksByType.length > 0 ? (
              analytics.tasksByType.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{task.type}</span>
                  <span className="text-lg font-bold text-purple-600">{task.count}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400">No tasks yet</div>
            )}
          </div>
        </motion.div>

        {/* Application Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Application Status
          </h2>
          <div className="space-y-3">
            {analytics?.applicationsByStatus && analytics.applicationsByStatus.length > 0 ? (
              analytics.applicationsByStatus.map((app, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {app.status === 'Approved' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {app.status === 'Pending' && <Clock className="w-4 h-4 text-yellow-600" />}
                    {app.status === 'Rejected' && <AlertCircle className="w-4 h-4 text-red-600" />}
                    <span className="text-sm font-medium text-gray-700">{app.status}</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{app.count}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400">No applications yet</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity and Top Builders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
            <Link href="/admin/applications">
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View All →
              </button>
            </Link>
          </div>
          <div className="space-y-3">
            {analytics?.recentApplications && analytics.recentApplications.length > 0 ? (
              analytics.recentApplications.map((app) => (
                <div key={app.id} className="flex items-start justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{app.builderName}</p>
                    <p className="text-xs text-gray-500 truncate">{app.taskTitle}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[app.status] || 'bg-gray-100 text-gray-800'}`}>
                    {app.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400">No recent applications</div>
            )}
          </div>
        </motion.div>

        {/* Top Builders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Top Builders
            </h2>
            <Link href="/admin/builders">
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View All →
              </button>
            </Link>
          </div>
          <div className="space-y-3">
            {analytics?.topBuilders && analytics.topBuilders.length > 0 ? (
              analytics.topBuilders.map((builder, index) => (
                <div key={builder.id} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{builder.name}</p>
                    <p className="text-xs text-gray-500">
                      {builder.approvedSubmissions}/{builder.totalSubmissions} submissions approved
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-600">{builder.totalApplications}</p>
                    <p className="text-xs text-gray-400">apps</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400">No builders yet</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
