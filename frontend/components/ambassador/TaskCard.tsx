import { TaskSummary } from '@/lib/types/ambassador';
import { formatDate } from '@/lib/api/ambassador';

interface TaskCardProps {
  task: TaskSummary;
  onViewDetails: () => void;
  onApply: () => void;
}

export default function TaskCard({ task, onViewDetails, onApply }: TaskCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">{task.title}</h3>
        <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
          {task.budgetUSDC} USDC
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-700">
          <span className="font-medium mr-2">📍 Location:</span>
          <span>
            {task.city ? `${task.city}, ` : ''}
            {task.country}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-700">
          <span className="font-medium mr-2">📅 Event:</span>
          <span>
            {formatDate(task.eventStartDate)} - {formatDate(task.eventEndDate)}
          </span>
        </div>

        {task.applicationDeadline && (
          <div className="flex items-center text-sm text-gray-700">
            <span className="font-medium mr-2">⏰ Apply by:</span>
            <span>{formatDate(task.applicationDeadline)}</span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-700">
          <span className="font-medium mr-2">🎯 KPIs:</span>
          <span>{task.kpiSummary || 'See details'}</span>
        </div>
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onViewDetails}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
        >
          View Details
        </button>
        <button
          onClick={onApply}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}
