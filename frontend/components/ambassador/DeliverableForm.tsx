import { useState } from 'react';
import { DeliverableRequirement, DeliverableInput } from '@/lib/types/ambassador';

interface DeliverableFormProps {
  requirement: DeliverableRequirement;
  onUpload: (deliverable: DeliverableInput) => Promise<void>;
  disabled?: boolean;
}

export default function DeliverableForm({
  requirement,
  onUpload,
  disabled = false,
}: DeliverableFormProps) {
  const [fileUrl, setFileUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const typeLabels: Record<string, string> = {
    PHOTO: 'Photo',
    VIDEO: 'Video',
    REPORT: 'Report',
    SOCIAL_POST: 'Social Media Post',
    ARTICLE: 'Article',
    OTHER: 'Other',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileUrl.trim()) {
      setError('File URL is required');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await onUpload({
        requirementId: requirement.requirementId,
        type: requirement.type,
        fileUrl: fileUrl.trim(),
        notes: notes.trim() || undefined,
      });

      setSuccess(true);
      // Reset form after success
      setTimeout(() => {
        setFileUrl('');
        setNotes('');
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload deliverable');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
              {typeLabels[requirement.type]}
            </span>
            {requirement.minQuantity && (
              <span className="text-xs text-gray-600">Min: {requirement.minQuantity}</span>
            )}
          </div>
          <p className="text-sm text-gray-700">{requirement.description}</p>
        </div>
        {success && <span className="text-green-600 text-sm font-medium">✓ Uploaded</span>}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://example.com/your-file.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
            disabled={disabled || uploading}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload your file to a cloud service and paste the link here
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Add any relevant notes about this deliverable..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
            disabled={disabled || uploading}
          />
        </div>

        <button
          type="submit"
          disabled={disabled || uploading || !fileUrl.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
        >
          {uploading ? 'Uploading...' : 'Upload Deliverable'}
        </button>
      </form>
    </div>
  );
}
