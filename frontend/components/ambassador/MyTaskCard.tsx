import { AssignmentSummary } from '@/lib/types/ambassador';
import { formatDate, formatCurrency } from '@/lib/api/ambassador';

interface MyTaskCardProps {
  assignment: AssignmentSummary;
  onClick: () => void;
}

export default function MyTaskCard({ assignment, onClick }: MyTaskCardProps) {
  const statusColors: Record<string, string> = {
    ASSIGNED: 'bg-blue-100 text-blue-800',
    AWAITING_SUBMISSION: 'bg-yellow-100 text-yellow-800',
    UNDER_REVIEW: 'bg-indigo-100 text-indigo-800',
    APPROVED: 'bg-green-100 text-green-800',
    REVISION_REQUESTED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-purple-100 text-purple-800',
  };

  const statusLabels: Record<string, string> = {
    ASSIGNED: 'Assigned',
    AWAITING_SUBMISSION: 'Awaiting Submission',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    REVISION_REQUESTED: 'Revision Requested',
    COMPLETED: 'Completed',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{assignment.taskTitle}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{assignment.taskDescription}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[assignment.status]
          }`}
        >
          {statusLabels[assignment.status]}
        </span>
      </div>

      {/* Event Date */}
      <div className="mb-4 flex items-center text-gray-600">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm">{formatDate(assignment.eventEndDate)}</span>
      </div>

      {/* Payment Info */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-500">Budget</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(assignment.budgetUSDC)}</p>
        </div>
      </div>

      {/* Key Dates */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Assigned:</span>
          <span className="text-gray-900 font-medium">{formatDate(assignment.assignedAt)}</span>
        </div>
        {assignment.completedAt && (
          <div className="flex justify-between">
            <span className="text-gray-600">Completed:</span>
            <span className="text-gray-900 font-medium">{formatDate(assignment.completedAt)}</span>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        {assignment.status === 'ASSIGNED' && (
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
            Start Working
          </button>
        )}
        {assignment.status === 'AWAITING_SUBMISSION' && (
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium">
            Submit Deliverables
          </button>
        )}
        {assignment.status === 'UNDER_REVIEW' && (
          <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium">
            View Submission
          </button>
        )}
        {assignment.status === 'APPROVED' && (
          <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium">
            View Payment
          </button>
        )}
        {assignment.status === 'REVISION_REQUESTED' && (
          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium">
            Revise Submission
          </button>
        )}
        {assignment.status === 'COMPLETED' && (
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium">
            View Details
          </button>
        )}
      </div>
    </div>
  );
}
