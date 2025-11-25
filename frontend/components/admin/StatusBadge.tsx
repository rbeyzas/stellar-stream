import { TaskStatus, ApplicationStatus, AssignmentStatus } from '@/lib/types/admin';

interface StatusBadgeProps {
  status: TaskStatus | ApplicationStatus | AssignmentStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusStyles = () => {
    const baseStyles = 'px-3 py-1 rounded-full text-xs font-semibold uppercase';

    switch (status) {
      // Task statuses
      case 'DRAFT':
        return `${baseStyles} bg-gray-100 text-gray-700`;
      case 'PUBLISHED':
        return `${baseStyles} bg-blue-100 text-blue-700`;
      case 'ASSIGNED':
        return `${baseStyles} bg-purple-100 text-purple-700`;
      case 'COMPLETED':
        return `${baseStyles} bg-green-100 text-green-700`;
      case 'CANCELLED':
        return `${baseStyles} bg-red-100 text-red-700`;

      // Application statuses
      case 'PENDING':
        return `${baseStyles} bg-yellow-100 text-yellow-700`;
      case 'ACCEPTED':
        return `${baseStyles} bg-green-100 text-green-700`;
      case 'REJECTED':
        return `${baseStyles} bg-red-100 text-red-700`;
      case 'WITHDRAWN':
        return `${baseStyles} bg-gray-100 text-gray-700`;

      // Assignment statuses
      case 'AWAITING_SUBMISSION':
        return `${baseStyles} bg-yellow-100 text-yellow-700`;
      case 'UNDER_REVIEW':
        return `${baseStyles} bg-blue-100 text-blue-700`;
      case 'APPROVED':
        return `${baseStyles} bg-green-100 text-green-700`;
      case 'REVISION_REQUESTED':
        return `${baseStyles} bg-orange-100 text-orange-700`;

      default:
        return `${baseStyles} bg-gray-100 text-gray-700`;
    }
  };

  return <span className={`${getStatusStyles()} ${className}`}>{status.replace(/_/g, ' ')}</span>;
}
