'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Users } from 'lucide-react';

export default function SelectRolePage() {
  const router = useRouter();

  const handleRoleSelection = (role: 'admin' | 'ambassador') => {
    // TODO: Bu bilgi backend'e kaydedilecek
    localStorage.setItem('userRole', role);

    if (role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/ambassador/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Select Your Role</h1>
          <p className="text-xl text-purple-200">Choose how you want to access the platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Admin Card */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRoleSelection('admin')}
            className="bg-white/10 backdrop-blur-lg border-2 border-white/20 hover:border-purple-400 rounded-3xl p-8 text-left transition-all group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Admin</h2>
            <p className="text-purple-200 mb-6">
              Manage ambassadors, create campaigns, track performance, and oversee all platform
              operations.
            </p>
            <ul className="space-y-2 text-purple-300">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                <span>Ambassador Management</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                <span>Campaign Creation</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                <span>Analytics & Reports</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                <span>Payment Management</span>
              </li>
            </ul>
          </motion.button>

          {/* Ambassador Card */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRoleSelection('ambassador')}
            className="bg-white/10 backdrop-blur-lg border-2 border-white/20 hover:border-pink-400 rounded-3xl p-8 text-left transition-all group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Ambassador</h2>
            <p className="text-purple-200 mb-6">
              Join campaigns, track your performance, manage referrals, and earn rewards for your
              efforts.
            </p>
            <ul className="space-y-2 text-purple-300">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                <span>Campaign Participation</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                <span>Performance Tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                <span>Referral Management</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                <span>Earnings & Wallet</span>
              </li>
            </ul>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
