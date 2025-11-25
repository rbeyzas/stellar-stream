interface KPIRequirementFormRowProps {
  metric: string;
  target: number;
  description: string;
  onMetricChange: (value: string) => void;
  onTargetChange: (value: number) => void;
  onDescriptionChange: (value: string) => void;
  onRemove: () => void;
}

export default function KPIRequirementFormRow({
  metric,
  target,
  description,
  onMetricChange,
  onTargetChange,
  onDescriptionChange,
  onRemove,
}: KPIRequirementFormRowProps) {
  return (
    <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="col-span-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Metric Name</label>
        <input
          type="text"
          value={metric}
          onChange={(e) => onMetricChange(e.target.value)}
          placeholder="e.g., attendees, impressions"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
        <input
          type="number"
          value={target}
          onChange={(e) => onTargetChange(parseInt(e.target.value) || 0)}
          placeholder="50"
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div className="col-span-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <input
          type="text"
          value={description || ''}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Additional context..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div className="col-span-1 flex items-end">
        <button
          type="button"
          onClick={onRemove}
          className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          title="Remove KPI"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
