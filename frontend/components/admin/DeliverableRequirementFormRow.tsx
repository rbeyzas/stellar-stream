interface DeliverableRequirementFormRowProps {
  type: 'PHOTO' | 'VIDEO' | 'REPORT' | 'SOCIAL_POST' | 'ARTICLE' | 'OTHER';
  description: string;
  minQuantity: number;
  onTypeChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onMinQuantityChange: (value: number) => void;
  onRemove: () => void;
}

const DELIVERABLE_TYPES = [
  { value: 'PHOTO', label: 'Photo' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'REPORT', label: 'Report' },
  { value: 'SOCIAL_POST', label: 'Social Media Post' },
  { value: 'ARTICLE', label: 'Article' },
  { value: 'OTHER', label: 'Other' },
] as const;

export default function DeliverableRequirementFormRow({
  type,
  description,
  minQuantity,
  onTypeChange,
  onDescriptionChange,
  onMinQuantityChange,
  onRemove,
}: DeliverableRequirementFormRowProps) {
  return (
    <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          {DELIVERABLE_TYPES.map((typeOption) => (
            <option key={typeOption.value} value={typeOption.value}>
              {typeOption.label}
            </option>
          ))}
        </select>
      </div>

      <div className="col-span-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="e.g., Event photos showing venue and attendees"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div className="col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Quantity</label>
        <input
          type="number"
          value={minQuantity || ''}
          onChange={(e) => onMinQuantityChange(parseInt(e.target.value) || 0)}
          placeholder="10"
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div className="col-span-1 flex items-end">
        <button
          type="button"
          onClick={onRemove}
          className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          title="Remove Deliverable"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
