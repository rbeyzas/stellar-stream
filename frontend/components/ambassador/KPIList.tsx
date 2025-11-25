import { KPIRequirement } from '@/lib/types/ambassador';

interface KPIListProps {
  kpis: KPIRequirement[];
  className?: string;
}

export default function KPIList({ kpis, className = '' }: KPIListProps) {
  if (!kpis || kpis.length === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        No KPI requirements specified for this task.
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {kpis.map((kpi, index) => (
        <div key={kpi.kpiRequirementId || index} className="border-l-4 border-blue-500 pl-4 py-2">
          <div className="flex items-baseline justify-between mb-1">
            <h4 className="font-semibold text-gray-900">{kpi.metric}</h4>
            <span className="text-lg font-bold text-blue-600">{kpi.target.toLocaleString()}</span>
          </div>
          {kpi.description && <p className="text-sm text-gray-600 mt-1">{kpi.description}</p>}
        </div>
      ))}
    </div>
  );
}
