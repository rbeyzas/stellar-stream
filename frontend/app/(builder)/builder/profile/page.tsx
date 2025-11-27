'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    fullName: 'Marcus Rodriguez',
    email: 'ambassador1@example.com',
    walletAddress: '0x9876543210fedcba',
    bio: 'Blockchain educator and community builder with 3+ years of experience in Web3. Passionate about making decentralized technology accessible to everyone.',
    location: 'San Francisco, CA',
    twitter: '@yourusername',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile updated:', formData);
    // TODO: API call to update profile
  };

  const stats = {
    memberSince: 'Jan 2024',
    tasksCompleted: 12,
    totalEarnings: 8450,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your ambassador profile and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary - Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Summary</h2>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-4">
              <span className="text-white font-bold text-3xl">MR</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center">{formData.fullName}</h3>
            <p className="text-sm text-gray-500 text-center mt-1">{formData.email}</p>
            <span className="mt-3 px-3 py-1 bg-cyan-500 text-cyan-900 rounded text-xs font-semibold">
              Ambassador
            </span>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Member Since</span>
              </span>
              <span className="text-sm font-semibold text-gray-900">{stats.memberSince}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Tasks Completed</span>
              </span>
              <span className="text-sm font-semibold text-gray-900">{stats.tasksCompleted}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600 flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Total Earnings</span>
              </span>
              <span className="text-sm font-semibold text-green-600">
                ${stats.totalEarnings.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Edit Profile Form - Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6">Edit Profile</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Wallet Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
              <input
                type="text"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Twitter Handle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter/X Handle
              </label>
              <input
                type="text"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="@yourusername"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    fullName: 'Marcus Rodriguez',
                    email: 'ambassador1@example.com',
                    walletAddress: '0x9876543210fedcba',
                    bio: 'Blockchain educator and community builder with 3+ years of experience in Web3. Passionate about making decentralized technology accessible to everyone.',
                    location: 'San Francisco, CA',
                    twitter: '@yourusername',
                  });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
