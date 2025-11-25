/**
 * Utility functions for Ambassador Hub
 */

import { customAlphabet } from 'nanoid';

// ID Generators
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

export const generateTaskId = () => `task_${nanoid()}`;
export const generateAmbassadorId = () => `amb_${nanoid()}`;
export const generateApplicationId = () => `app_${nanoid()}`;
export const generateAssignmentId = () => `asg_${nanoid()}`;
export const generateSubmissionId = () => `sub_${nanoid()}`;
export const generateReviewId = () => `rev_${nanoid()}`;
export const generateStreamLinkId = () => `stm_${nanoid()}`;
export const generateKPIId = () => `kpi_${nanoid()}`;
export const generateDeliverableId = () => `del_${nanoid()}`;

/**
 * Calculate completion percentage for a task
 */
export function calculateTaskCompletion(
  startDate: Date,
  endDate: Date,
  currentDate: Date = new Date(),
): number {
  if (currentDate < startDate) return 0;
  if (currentDate > endDate) return 100;

  const total = endDate.getTime() - startDate.getTime();
  const elapsed = currentDate.getTime() - startDate.getTime();

  return Math.round((elapsed / total) * 100);
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(scores: (number | undefined)[]): number | undefined {
  const validScores = scores.filter((s): s is number => s !== undefined);
  if (validScores.length === 0) return undefined;

  const sum = validScores.reduce((acc, score) => acc + score, 0);
  return Math.round((sum / validScores.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Format currency (USDC)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date range
 */
export function formatDateRange(start: Date, end: Date): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

/**
 * Calculate days until deadline
 */
export function daysUntil(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if KPI requirement is met
 */
export function isKPIMet(actualValue: number, minValue: number): boolean {
  return actualValue >= minValue;
}

/**
 * Calculate KPI completion percentage
 */
export function calculateKPICompletion(actualValue: number, minValue: number): number {
  if (minValue === 0) return actualValue > 0 ? 100 : 0;
  const percentage = (actualValue / minValue) * 100;
  return Math.min(100, Math.round(percentage));
}

/**
 * Validate file size
 */
export function isFileSizeValid(fileSizeMB: number, maxSizeMB?: number): boolean {
  if (!maxSizeMB) return true;
  return fileSizeMB <= maxSizeMB;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Validate file type
 */
export function isFileTypeValid(filename: string, allowedTypes: string[]): boolean {
  const ext = getFileExtension(filename);
  return allowedTypes.includes(ext);
}

/**
 * Calculate stream payment schedule
 */
export interface PaymentSchedule {
  upfrontAmount: number;
  streamedAmount: number;
  postEventAmount: number;
}

export function calculatePaymentSchedule(
  totalAmount: number,
  config: {
    model: 'UPFRONT_CHUNK' | 'LINEAR_DURING_EVENT' | 'POST_EVENT' | 'HYBRID';
    upfrontPercentage?: number;
    postEventPercentage?: number;
  },
): PaymentSchedule {
  const schedule: PaymentSchedule = {
    upfrontAmount: 0,
    streamedAmount: 0,
    postEventAmount: 0,
  };

  switch (config.model) {
    case 'UPFRONT_CHUNK':
      schedule.upfrontAmount = totalAmount * 0.5;
      schedule.postEventAmount = totalAmount * 0.5;
      break;

    case 'LINEAR_DURING_EVENT':
      schedule.streamedAmount = totalAmount;
      break;

    case 'POST_EVENT':
      schedule.postEventAmount = totalAmount;
      break;

    case 'HYBRID':
      const upfront = config.upfrontPercentage || 0;
      const postEvent = config.postEventPercentage || 0;
      const streamed = 100 - upfront - postEvent;

      schedule.upfrontAmount = totalAmount * (upfront / 100);
      schedule.streamedAmount = totalAmount * (streamed / 100);
      schedule.postEventAmount = totalAmount * (postEvent / 100);
      break;
  }

  return schedule;
}

/**
 * Format time ago (e.g., "2 hours ago")
 */
export function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

/**
 * Slugify string for URLs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
