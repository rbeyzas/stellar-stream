import { StreamLink } from '@/lib/types/ambassador';
import { formatCurrency, formatDateTime } from '@/lib/api/ambassador';

interface StreamCardProps {
  stream: StreamLink;
  onViewStream?: (streamId: string) => void;
}

export default function StreamCard({ stream, onViewStream }: StreamCardProps) {
  const statusColors: Record<string, string> = {
    PENDING_CREATION: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    PAUSED: 'bg-gray-100 text-gray-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    PENDING_CREATION: 'Pending Creation',
    ACTIVE: 'Active',
    PAUSED: 'Paused',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Payment Stream</h3>
          <p className="text-sm text-gray-600">{stream.taskTitle}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[stream.status]}`}
        >
          {statusLabels[stream.status]}
        </span>
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Amount</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(stream.totalAmount)} {stream.assetCode}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Asset</p>
          <p className="text-sm font-medium text-gray-900">{stream.assetCode}</p>
        </div>
      </div>

      {/* Stream Dates */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Created:</span>
          <span className="text-gray-900 font-medium">{formatDateTime(stream.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Updated:</span>
          <span className="text-gray-900 font-medium">{formatDateTime(stream.updatedAt)}</span>
        </div>
      </div>

      {/* Stream Address */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">Contract ID</p>
        <div className="flex items-center gap-2">
          <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
            {stream.contractId}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(stream.contractId);
            }}
            className="text-blue-600 hover:text-blue-700 text-xs"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {stream.status === 'ACTIVE' && (
          <button
            onClick={() => stream.stellarStreamId && onViewStream?.(stream.stellarStreamId)}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            Claim Tokens
          </button>
        )}
        <button
          onClick={() => stream.stellarStreamId && onViewStream?.(stream.stellarStreamId)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          View Stream
        </button>
      </div>
    </div>
  );
}
