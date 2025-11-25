import { TaskDetail } from '@/lib/types/ambassador';
import { formatDate } from '@/lib/api/ambassador';

interface TaskDetailModalProps {
  task: TaskDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

export default function TaskDetailModal({ task, isOpen, onClose, onApply }: TaskDetailModalProps) {
  if (!isOpen || !task) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                📍 {task.city ? `${task.city}, ` : ''}
                {task.country}
              </span>
              <span>💰 {task.budgetUSDC} USDC</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </section>

          {/* Event Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Start Date:</span>
                <span className="ml-2 text-gray-900">{formatDate(task.eventStartDate)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">End Date:</span>
                <span className="ml-2 text-gray-900">{formatDate(task.eventEndDate)}</span>
              </div>
              {task.applicationDeadline && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">Application Deadline:</span>
                  <span className="ml-2 text-gray-900">{formatDate(task.applicationDeadline)}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Language:</span>
                <span className="ml-2 text-gray-900">{task.language}</span>
              </div>
              {task.ecosystemId && (
                <div>
                  <span className="font-medium text-gray-700">Ecosystem:</span>
                  <span className="ml-2 text-gray-900">{task.ecosystemId}</span>
                </div>
              )}
            </div>
          </section>

          {/* KPI Requirements */}
          {task.kpiRequirements.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">KPI Requirements</h3>
              <div className="space-y-2">
                {task.kpiRequirements.map((kpi) => (
                  <div key={kpi.kpiRequirementId} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-gray-900">{kpi.metric}:</span>
                      <span className="text-blue-600 font-semibold">{kpi.target}+</span>
                    </div>
                    {kpi.description && (
                      <p className="text-sm text-gray-600 mt-1">{kpi.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Deliverable Requirements */}
          {task.deliverableRequirements.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Deliverable Requirements</h3>
              <div className="space-y-2">
                {task.deliverableRequirements.map((deliverable) => (
                  <div
                    key={deliverable.requirementId}
                    className="border-l-4 border-green-500 pl-4 py-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                        {deliverable.type}
                      </span>
                      {deliverable.minQuantity && (
                        <span className="text-sm text-gray-600">
                          Min: {deliverable.minQuantity}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{deliverable.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={onApply}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Apply for This Task
          </button>
        </div>
      </div>
    </div>
  );
}
