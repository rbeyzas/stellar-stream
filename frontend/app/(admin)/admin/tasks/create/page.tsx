'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Plus,
  X,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { TaskType, TaskStatus, KPI } from '@/types/task';

export default function CreateTaskPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Workshop' as TaskType,
    status: 'Open' as TaskStatus,
    location: '',
    date: '',
    budget: '',
    streamDuration: '',
    description: '',
  });

  const [kpis, setKpis] = useState<KPI[]>([]);
  const [newKpi, setNewKpi] = useState({ name: '', target: '', description: '' });

  const requiresLocationDate = ['Workshop', 'Hackathon', 'Meetup'].includes(formData.type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const createdByEmail =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('userEmail') || 'admin@local.test'
          : 'admin@local.test';
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget),
          streamDuration: (parseFloat(formData.streamDuration) || 0) * 3600, // Convert hours to seconds
          kpis: kpis.map((kpi) => ({
            name: kpi.name,
            target: kpi.target,
            description: kpi.description,
          })),
          createdByEmail,
        }),
      });

      if (response.ok) {
        router.push('/admin/tasks');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}\nDetails: ${error.details || ''}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addKpi = () => {
    if (newKpi.name && newKpi.target) {
      setKpis([...kpis, { ...newKpi, id: Date.now().toString() }]);
      setNewKpi({ name: '', target: '', description: '' });
    }
  };

  const removeKpi = (id: string) => {
    setKpis(kpis.filter((kpi) => kpi.id !== id));
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
            <p className="text-gray-500 mt-1">Add a new workshop, hackathon, or event</p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Meetup">Meetup</option>
                    <option value="Part-time Job">Part-time Job</option>
                    <option value="Full-time Job">Full-time Job</option>
                    <option value="Hourly Job">Hourly Job</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
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

          {/* Location and Date - Only for Events */}
          {requiresLocationDate && (
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
                    required={requiresLocationDate}
                    placeholder="e.g., Stanford University, CA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
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
                    required={requiresLocationDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Budget and Stream Settings */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Budget & Stream Settings</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (XLM) *</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="500"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stream Duration (Hours) *
                </label>
                <input
                  type="number"
                  name="streamDuration"
                  value={formData.streamDuration}
                  onChange={handleChange}
                  required
                  min="0.1"
                  step="0.1"
                  placeholder="e.g. 24 for 1 day"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How long the payment stream will last once started.
                </p>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Key Performance Indicators (KPIs)</span>
            </h2>

            {/* KPI List */}
            {kpis.length > 0 && (
              <div className="space-y-3 mb-4">
                {kpis.map((kpi) => (
                  <div
                    key={kpi.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {kpi.name} - Target: {kpi.target}
                      </div>
                      {kpi.description && (
                        <div className="text-sm text-gray-600 mt-1">{kpi.description}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeKpi(kpi.id!)}
                      className="ml-4 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New KPI */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KPI Name</label>
                  <input
                    type="text"
                    value={newKpi.name}
                    onChange={(e) => setNewKpi({ ...newKpi, name: e.target.value })}
                    placeholder="e.g., Number of attendees"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                  <input
                    type="text"
                    value={newKpi.target}
                    onChange={(e) => setNewKpi({ ...newKpi, target: e.target.value })}
                    placeholder="e.g., 50+ people"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newKpi.description}
                  onChange={(e) => setNewKpi({ ...newKpi, description: e.target.value })}
                  placeholder="Additional context about this KPI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
                />
              </div>
              <button
                type="button"
                onClick={addKpi}
                disabled={!newKpi.name || !newKpi.target}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Add KPI</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the task, goals, and what participants can expect..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
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
              <span>{isSubmitting ? 'Creating...' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
