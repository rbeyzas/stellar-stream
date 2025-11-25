import { useState } from 'react';
import { ReviewDecision } from '@/lib/types/admin';
import { reviewSubmission } from '@/lib/api/admin';

interface ReviewDecisionPanelProps {
  submissionId: string;
  onReviewed?: () => void;
}

export default function ReviewDecisionPanel({
  submissionId,
  onReviewed,
}: ReviewDecisionPanelProps) {
  const [decision, setDecision] = useState<ReviewDecision>('APPROVE');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      setError('Please provide a comment');
      return;
    }

    if (!confirm(`Are you sure you want to ${decision.toLowerCase()} this submission?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await reviewSubmission(submissionId, { decision, comment });
      alert('Review submitted successfully!');
      onReviewed?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Decision</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="decision"
                value="APPROVE"
                checked={decision === 'APPROVE'}
                onChange={(e) => setDecision(e.target.value as ReviewDecision)}
                className="mr-2"
              />
              <span className="text-sm">
                <span className="font-medium text-green-700">Approve</span>
                <span className="text-gray-600"> - Accept the submission</span>
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="decision"
                value="REQUEST_CHANGES"
                checked={decision === 'REQUEST_CHANGES'}
                onChange={(e) => setDecision(e.target.value as ReviewDecision)}
                className="mr-2"
              />
              <span className="text-sm">
                <span className="font-medium text-orange-700">Request Changes</span>
                <span className="text-gray-600"> - Ask for revisions</span>
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                name="decision"
                value="REJECT"
                checked={decision === 'REJECT'}
                onChange={(e) => setDecision(e.target.value as ReviewDecision)}
                className="mr-2"
              />
              <span className="text-sm">
                <span className="font-medium text-red-700">Reject</span>
                <span className="text-gray-600"> - Decline the submission</span>
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Provide feedback to the ambassador..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This comment will be visible to the ambassador
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
