'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Submission } from '@/lib/types/admin';
import { getSubmission } from '@/lib/api/admin';
import StatusBadge from '@/components/admin/StatusBadge';
import ReviewDecisionPanel from '@/components/admin/ReviewDecisionPanel';

export default function SubmissionReviewPage() {
  const params = useParams();
  const submissionId = params?.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubmission = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubmission(submissionId);
      setSubmission(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    if (submissionId) {
      loadSubmission();
    }
  }, [submissionId, loadSubmission]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Submission not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submission Review</h1>
          <p className="text-sm text-gray-600">Submission ID: {submission.submissionId}</p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Submission Content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Assignment ID:</span>
                <span className="ml-2 font-medium text-gray-900">{submission.assignmentId}</span>
              </div>
              <div>
                <span className="text-gray-600">Submitted:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(submission.submittedAt).toLocaleString()}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Ambassador ID:</span>
                <span className="ml-2 font-medium text-gray-900">{submission.ambassadorId}</span>
              </div>
            </div>
          </div>

          {/* Ambassador Notes */}
          {submission.ambassadorNotes && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ambassador Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{submission.ambassadorNotes}</p>
            </div>
          )}

          {/* KPI Achievements */}
          {submission.kpiAchievements && submission.kpiAchievements.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">KPI Achievements</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">
                        KPI Requirement
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Target</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Achieved</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {submission.kpiAchievements.map((kpi) => (
                      <tr key={kpi.kpiAchievementId}>
                        <td className="px-4 py-3 text-gray-900">{kpi.kpiRequirementId}</td>
                        <td className="px-4 py-3 text-gray-700">{kpi.targetValue}</td>
                        <td className="px-4 py-3 font-semibold text-blue-600">
                          {kpi.achievedValue}
                        </td>
                        <td className="px-4 py-3">
                          {kpi.achievedValue >= kpi.targetValue ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              ✓ Met
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                              ✗ Not Met
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Deliverables */}
          {submission.deliverables && submission.deliverables.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Deliverables</h2>
              <div className="space-y-4">
                {submission.deliverables.map((deliverable) => (
                  <div
                    key={deliverable.deliverableId}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                        {deliverable.type}
                      </span>
                      <span className="text-sm text-gray-600">
                        Requirement: {deliverable.requirementId}
                      </span>
                    </div>
                    {deliverable.description && (
                      <p className="text-sm text-gray-700 mb-3">{deliverable.description}</p>
                    )}
                    {deliverable.fileUrl && (
                      <a
                        href={deliverable.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        📎 View File/Link
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review History */}
          {submission.reviewComment && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Previous Review</h2>
              {submission.reviewedAt && (
                <p className="text-sm text-gray-600 mb-2">
                  Reviewed on: {new Date(submission.reviewedAt).toLocaleString()}
                </p>
              )}
              {submission.reviewedBy && (
                <p className="text-sm text-gray-600 mb-3">Reviewed by: {submission.reviewedBy}</p>
              )}
              <div className="bg-gray-50 rounded p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {submission.reviewComment}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Review Panel (1/3) */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Status</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Current Status:</span>
                <div className="mt-2">
                  <StatusBadge status={submission.status} />
                </div>
              </div>
              {submission.reviewedAt && (
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Last Updated:</span>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {new Date(submission.reviewedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Review Decision Panel */}
          {submission.status === 'PENDING_REVIEW' && (
            <ReviewDecisionPanel
              submissionId={submission.submissionId}
              onReviewed={loadSubmission}
            />
          )}

          {submission.status === 'REVISION_REQUESTED' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Revisions have been requested. Waiting for ambassador to resubmit.
              </p>
            </div>
          )}

          {submission.status === 'APPROVED' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">✅ This submission has been approved.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
