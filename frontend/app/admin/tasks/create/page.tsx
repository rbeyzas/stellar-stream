'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CreateTaskInput } from '@/lib/types/admin';
import { createTask, updateTask, getTask } from '@/lib/api/admin';
import KPIRequirementFormRow from '@/components/admin/KPIRequirementFormRow';
import DeliverableRequirementFormRow from '@/components/admin/DeliverableRequirementFormRow';

export default function TaskForm() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;
  const taskId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: '',
    country: 'Global',
    city: '',
    language: 'en',
    budgetUSDC: 0,
    applicationDeadline: '',
    eventStartDate: '',
    eventEndDate: '',
    tags: [],
    ecosystemId: '',
    kpiRequirements: [],
    deliverableRequirements: [],
    publish: false,
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadTask();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, isEdit]);

  const loadTask = async () => {
    try {
      setLoadingTask(true);
      const task = await getTask(taskId);

      setFormData({
        title: task.title,
        description: task.description,
        country: 'Global',
        city: '',
        language: task.language,
        budgetUSDC: task.budgetUSDC,
        applicationDeadline: task.applicationDeadline || '',
        eventStartDate: task.eventStartDate,
        eventEndDate: task.eventEndDate,
        tags: task.tags || [],
        ecosystemId: '',
        kpiRequirements: task.kpiRequirements.map(({ metric, target, description }) => ({
          metric,
          target,
          description,
        })),
        deliverableRequirements: task.deliverableRequirements.map(
          ({ type, description, minQuantity }) => ({
            type,
            description,
            minQuantity,
          }),
        ),
        publish: task.status === 'PUBLISHED',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task');
    } finally {
      setLoadingTask(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, shouldPublish: boolean) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { ...formData, publish: shouldPublish };

      if (isEdit) {
        await updateTask(taskId, payload);
        alert('Task updated successfully!');
      } else {
        const newTask = await createTask(payload);
        alert('Task created successfully!');
        router.push(`/admin/tasks/${newTask.taskId}`);
        return;
      }

      router.push('/admin/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const addKPI = () => {
    setFormData({
      ...formData,
      kpiRequirements: [...formData.kpiRequirements, { metric: '', target: 0, description: '' }],
    });
  };

  const removeKPI = (index: number) => {
    setFormData({
      ...formData,
      kpiRequirements: formData.kpiRequirements.filter((_, i) => i !== index),
    });
  };

  const updateKPI = (index: number, field: string, value: any) => {
    const updated = [...formData.kpiRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, kpiRequirements: updated });
  };

  const addDeliverable = () => {
    setFormData({
      ...formData,
      deliverableRequirements: [
        ...formData.deliverableRequirements,
        { type: 'PHOTO', description: '', minQuantity: 1 },
      ],
    });
  };

  const removeDeliverable = (index: number) => {
    setFormData({
      ...formData,
      deliverableRequirements: formData.deliverableRequirements.filter((_, i) => i !== index),
    });
  };

  const updateDeliverable = (index: number, field: string, value: any) => {
    const updated = [...formData.deliverableRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, deliverableRequirements: updated });
  };

  const addTag = () => {
    if (tagInput.trim() && !(formData.tags || []).includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter((t) => t !== tag),
    });
  };

  if (loadingTask) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isEdit ? 'Edit Task' : 'Create New Task'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    placeholder="e.g., en, tr, es"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (USDC) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.budgetUSDC}
                    onChange={(e) =>
                      setFormData({ ...formData, budgetUSDC: parseFloat(e.target.value) })
                    }
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Deadline</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Set a deadline for ambassadors to apply. Leave empty if no deadline.
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(formData.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* KPI Requirements */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">KPI Requirements</h2>
              <button
                type="button"
                onClick={addKPI}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                + Add KPI
              </button>
            </div>

            {formData.kpiRequirements.length === 0 ? (
              <p className="text-gray-500 text-sm">No KPI requirements added yet</p>
            ) : (
              <div className="space-y-3">
                {formData.kpiRequirements.map((kpi, index) => (
                  <KPIRequirementFormRow
                    key={index}
                    metric={kpi.metric}
                    target={kpi.target}
                    description={kpi.description || ''}
                    onMetricChange={(value) => updateKPI(index, 'metric', value)}
                    onTargetChange={(value) => updateKPI(index, 'target', value)}
                    onDescriptionChange={(value) => updateKPI(index, 'description', value)}
                    onRemove={() => removeKPI(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Deliverable Requirements */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Deliverable Requirements</h2>
              <button
                type="button"
                onClick={addDeliverable}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                + Add Deliverable
              </button>
            </div>

            {formData.deliverableRequirements.length === 0 ? (
              <p className="text-gray-500 text-sm">No deliverable requirements added yet</p>
            ) : (
              <div className="space-y-3">
                {formData.deliverableRequirements.map((deliverable, index) => (
                  <DeliverableRequirementFormRow
                    key={index}
                    type={deliverable.type}
                    description={deliverable.description}
                    minQuantity={deliverable.minQuantity || 1}
                    onTypeChange={(value) => updateDeliverable(index, 'type', value)}
                    onDescriptionChange={(value) => updateDeliverable(index, 'description', value)}
                    onMinQuantityChange={(value) => updateDeliverable(index, 'minQuantity', value)}
                    onRemove={() => removeDeliverable(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Publishing...' : 'Publish Task'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
