'use client';

import { use, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface KPI {
  id: string;
  name: string;
  target: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  location?: string;
  date?: string;
  budget: number;
  kpis: KPI[];
}

interface KPIResult {
  kpiId: string;
  achievedValue: string;
  notes: string;
}

export default function SubmitWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [summary, setSummary] = useState('');
  const [kpiResults, setKpiResults] = useState<KPIResult[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`/api/tasks/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTask(data);

          // Initialize KPI results
          if (data.kpis) {
            setKpiResults(
              data.kpis.map((kpi: KPI) => ({
                kpiId: kpi.id,
                achievedValue: '',
                notes: '',
              })),
            );
          }
        }
      } catch (error) {
        console.error('Error fetching task:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleKpiChange = (index: number, field: 'achievedValue' | 'notes', value: string) => {
    const updated = [...kpiResults];
    updated[index][field] = value;
    setKpiResults(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isDraft: boolean) => {
    setSubmitting(true);
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        alert('User email not found');
        return;
      }

      const formData = new FormData();
      formData.append('taskId', id);
      formData.append('builderEmail', userEmail);
      formData.append('summary', summary);
      formData.append('status', isDraft ? 'draft' : 'submitted');
      formData.append('kpiResults', JSON.stringify(kpiResults));

      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert(isDraft ? 'Saved as draft!' : 'Submitted for review!');
        router.push('/builder/my-tasks');
      } else {
        alert('Failed to submit work');
      }
    } catch (error) {
      console.error('Error submitting work:', error);
      alert('Error submitting work');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Task not found</p>
        <Link href="/builder/my-tasks">
          <button className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border hover:bg-gray-200">
            Back to My Tasks
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/builder/my-tasks">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-gray-500 mt-1">Submit your work</p>
          </div>
        </div>
        <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
          ${task.budget.toLocaleString()}
        </span>
      </div>

      {/* Submission Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
      >
        <div className="space-y-8">
          {/* Summary of Work */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Submission Summary</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary of Work Completed
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Provide a detailed summary of the event, what you accomplished, and any notable highlights..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-2">
              Include details about the event execution, audience engagement, and overall outcomes.
            </p>
          </div>

          {/* KPI Results */}
          {task.kpis && task.kpis.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">KPI Results</h3>
              <div className="space-y-6">
                {task.kpis.map((kpi, index) => (
                  <div key={kpi.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-4">
                      <p className="font-semibold text-gray-900">{kpi.name}</p>
                      <p className="text-sm text-gray-500">Target: {kpi.target}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Achieved Value
                        </label>
                        <input
                          type="text"
                          value={kpiResults[index]?.achievedValue || ''}
                          onChange={(e) => handleKpiChange(index, 'achievedValue', e.target.value)}
                          placeholder="e.g., 65"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes (Optional)
                        </label>
                        <input
                          type="text"
                          value={kpiResults[index]?.notes || ''}
                          onChange={(e) => handleKpiChange(index, 'notes', e.target.value)}
                          placeholder="Additional context..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supporting Files */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Supporting Files</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-700 font-medium mb-2">Upload Photos, Videos, or Documents</p>
              <p className="text-sm text-gray-500 mb-4">
                Click to browse or drag and drop files here
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <span className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border hover:bg-gray-200 cursor-pointer">
                  Choose Files
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Upload photos from the event, presentation slides, social media screenshots, or any
              other relevant documentation.
            </p>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-4">
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting || !summary.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
