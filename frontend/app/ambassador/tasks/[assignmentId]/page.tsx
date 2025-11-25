'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import KPIList from '@/components/ambassador/KPIList';
import DeliverableForm from '@/components/ambassador/DeliverableForm';
import { AssignmentDetail, DeliverableInput, SubmissionInput } from '@/lib/types/ambassador';
import { getAssignmentDetail, submitAssignment } from '@/lib/api/ambassador';
import { formatDate } from '@/lib/api/ambassador';

export default function TaskExecutionPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.assignmentId as string;

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deliverables, setDeliverables] = useState<DeliverableInput[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignment = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAssignmentDetail(assignmentId);
      setAssignment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const handleDeliverableUpload = async (deliverable: DeliverableInput) => {
    // Add to local state
    setDeliverables((prev) => {
      // Remove any existing deliverable with the same requirementId
      const filtered = prev.filter((d) => d.requirementId !== deliverable.requirementId);
      return [...filtered, deliverable];
    });
  };

  const handleSubmitAll = async () => {
    if (!assignment) return;

    // Validate all deliverables are uploaded
    const missingDeliverables = assignment.task.deliverableRequirements.filter(
      (req) => !deliverables.find((d) => d.requirementId === req.requirementId),
    );

    if (missingDeliverables.length > 0) {
      alert(`Please upload all required deliverables. Missing: ${missingDeliverables.length}`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const submission: SubmissionInput = {
        kpiValues: [], // Would need KPI tracking in a real app
        deliverables,
        additionalNotes: 'Submission completed via Ambassador UI',
      };

      await submitAssignment(assignmentId, submission);
      alert('Submission successful! Your work has been submitted for review.');
      router.push('/ambassador/my-tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Assignment not found'}
          </div>
          <button
            onClick={() => router.push('/ambassador/my-tasks')}
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to My Tasks
          </button>
        </div>
      </div>
    );
  }

  const isReadOnly =
    assignment.status !== 'ASSIGNED' && assignment.status !== 'AWAITING_SUBMISSION';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/ambassador/my-tasks')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center text-sm"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to My Tasks
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.task.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{assignment.task.city || assignment.task.country}</span>
            <span>•</span>
            <span>Event: {formatDate(assignment.task.eventEndDate)}</span>
            <span>•</span>
            <span className="capitalize">{assignment.status.toLowerCase().replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Task Brief */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Task Brief</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{assignment.task.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">KPI Requirements</h3>
                  <KPIList kpis={assignment.task.kpiRequirements} />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Budget</h3>
                  <p className="text-2xl font-bold text-green-600">
                    ${assignment.task.budgetUSDC.toLocaleString()} USDC
                  </p>
                </div>

                {assignment.adminNotes && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <h3 className="text-sm font-medium text-blue-900 mb-1">Admin Notes</h3>
                    <p className="text-sm text-blue-800">{assignment.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Deliverables */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Deliverables</h2>

              {isReadOnly && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
                  This assignment is {assignment.status.toLowerCase().replace('_', ' ')}. You cannot
                  modify deliverables at this time.
                </div>
              )}

              <div className="space-y-4">
                {assignment.task.deliverableRequirements.map((req) => {
                  const uploaded = deliverables.find((d) => d.requirementId === req.requirementId);
                  return (
                    <div key={req.requirementId} className="relative">
                      <DeliverableForm
                        requirement={req}
                        onUpload={handleDeliverableUpload}
                        disabled={isReadOnly}
                      />
                      {uploaded && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            {!isReadOnly && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Ready to Submit?</h3>
                    <p className="text-sm text-gray-600">
                      Uploaded {deliverables.length} of{' '}
                      {assignment.task.deliverableRequirements.length} deliverables
                    </p>
                  </div>
                  <button
                    onClick={handleSubmitAll}
                    disabled={
                      submitting ||
                      deliverables.length !== assignment.task.deliverableRequirements.length
                    }
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {submitting ? 'Submitting...' : 'Submit All Deliverables'}
                  </button>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* View Submission */}
            {assignment.submission && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Submission</h2>
                <div className="space-y-4">
                  {assignment.submission.deliverables.map((deliverable, index) => (
                    <div key={index} className="border border-gray-200 rounded p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Deliverable #{index + 1}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {deliverable.type}
                        </span>
                      </div>
                      <a
                        href={deliverable.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm break-all"
                      >
                        {deliverable.fileUrl}
                      </a>
                      {deliverable.notes && (
                        <p className="text-sm text-gray-600 mt-2">{deliverable.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
