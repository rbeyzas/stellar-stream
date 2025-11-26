import { nanoid } from 'nanoid';

// ============================================================================
// ID Generators
// ============================================================================

export const generateTaskId = (): string => `task_${nanoid(16)}`;
export const generateApplicationId = (): string => `app_${nanoid(16)}`;
export const generateAssignmentId = (): string => `asg_${nanoid(16)}`;
export const generateSubmissionId = (): string => `sub_${nanoid(16)}`;
export const generateKPIRequirementId = (): string => `kpi_${nanoid(12)}`;
export const generateDeliverableRequirementId = (): string => `del_${nanoid(12)}`;
export const generateStreamLinkId = (): string => `stream_${nanoid(16)}`;
export const generateReviewId = (): string => `rev_${nanoid(16)}`;
export const generateProfileId = (): string => `prof_${nanoid(16)}`;

// ============================================================================
// Date Validation Helpers
// ============================================================================

export const isDateInFuture = (date: Date): boolean => {
  return new Date(date) > new Date();
};

export const isDateInPast = (date: Date): boolean => {
  return new Date(date) < new Date();
};

export const isDateRangeValid = (startDate: Date, endDate: Date): boolean => {
  return new Date(endDate) > new Date(startDate);
};

// ============================================================================
// Task Status Helpers
// ============================================================================

export const canApplyToTask = (status: string, applicationDeadline?: Date): boolean => {
  if (status !== 'PUBLISHED') return false;
  if (!applicationDeadline) return true;
  return isDateInFuture(applicationDeadline);
};

// ============================================================================
// Validation Result Type
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============================================================================
// Task Validation
// ============================================================================

export const validateTaskDates = (
  eventStartDate: Date,
  eventEndDate: Date,
  applicationDeadline?: Date,
): ValidationResult => {
  const errors: string[] = [];

  if (!isDateRangeValid(eventStartDate, eventEndDate)) {
    errors.push('Event end date must be after start date');
  }

  if (applicationDeadline && new Date(applicationDeadline) >= new Date(eventStartDate)) {
    errors.push('Application deadline must be before event start date');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// Pagination Helpers
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export const parsePagination = (
  page?: string | number,
  limit?: string | number,
): PaginationParams => {
  const pageNum = typeof page === 'string' ? parseInt(page, 10) : page || 1;
  const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit || 20;

  const safePage = Math.max(1, pageNum);
  const safeLimit = Math.min(100, Math.max(1, limitNum)); // Max 100 items per page

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

// ============================================================================
// Query Filter Helpers
// ============================================================================

export const buildDateRangeFilter = (from?: string, to?: string): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};

  if (from) {
    filter.$gte = new Date(from);
  }

  if (to) {
    filter.$lte = new Date(to);
  }

  return Object.keys(filter).length > 0 ? filter : {};
};

// ============================================================================
// Safe Parse Helpers
// ============================================================================

export const parseIntSafe = (value: unknown, defaultValue: number): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

export const parseFloatSafe = (value: unknown, defaultValue: number): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};
