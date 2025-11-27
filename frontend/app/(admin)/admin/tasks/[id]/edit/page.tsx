'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, MapPin, Calendar, DollarSign, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import { TaskType, TaskStatus } from '@/types/task';

// Mock data - bu kısım daha sonra API'den gelecek
const mockTask = {
  id: '1',
  title: 'Ethereum Workshop at Stanford',
  type: 'Workshop' as TaskType,
  status: 'Open' as TaskStatus,
  location: 'Stanford University, CA',
  date: '2025-02-15',
  budget: 500,
  maxApplicants: 1,
  currentApplicants: 3,
  description: 'Educational workshop about Ethereum development',
  requirements:
    'Experience with Ethereum\nPublic speaking skills\nAvailable for full event duration',
  createdAt: '2024-11-20',
  updatedAt: '2024-11-20',
};

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: Fetch task data from API using id
  const [formData, setFormData] = useState({
    title: mockTask.title,
    type: mockTask.type,
    status: mockTask.status,
    location: mockTask.location,
    date: mockTask.date,
    budget: mockTask.budget.toString(),
    maxApplicants: mockTask.maxApplicants.toString(),
    description: mockTask.description || '',
    requirements: mockTask.requirements || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: API call to update task
    console.log('Updating task:', id, formData);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/admin/tasks');
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/tasks">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
            <p className="text-gray-500 mt-1">Update task information</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Basic Information</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Ethereum Workshop at Stanford"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Meetup">Meetup</option>
                    <option value="Conference">Conference</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Location and Date */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Location & Date</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Stanford University, CA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Date *</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Budget and Applicants */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Budget & Applicants</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (XLM) *
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="500"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Max Applicants *</span>
                </label>
                <input
                  type="number"
                  name="maxApplicants"
                  value={formData.maxApplicants}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description & Requirements</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the task, goals, and what participants can expect..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements (one per line)
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Experience with Ethereum&#10;Public speaking skills&#10;Available for full event duration"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-gray-200 flex items-center justify-end space-x-4">
            <Link href="/admin/tasks">
              <button
                type="button"
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
