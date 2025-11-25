// ============================================================================
// Admin API Client
// ============================================================================

import {
  Task,
  TaskListResponse,
  CreateTaskInput,
  TaskApplication,
  Assignment,
  Submission,
  DashboardStats,
  ReviewSubmissionInput,
} from '../types/admin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============================================================================
// Helper Functions
// ============================================================================

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`, // TODO: Implement token management
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

function getAuthToken(): string {
  // TODO: Implement actual token retrieval from localStorage/cookie
  return 'admin-token';
}

// ============================================================================
// Dashboard API
// ============================================================================

export async function getDashboardStats(): Promise<DashboardStats> {
  // Since we don't have a dedicated stats endpoint, we'll aggregate from tasks
  const tasks = await fetchAPI<TaskListResponse>('/tasks?limit=100');

  return {
    activeTasks: tasks.tasks.filter((t) => t.status === 'PUBLISHED').length,
    assignedTasks: tasks.tasks.filter((t) => t.status === 'ASSIGNED').length,
    completedTasks: tasks.tasks.filter((t) => t.status === 'COMPLETED').length,
    pendingSubmissions: 0, // TODO: Add submissions count when endpoint available
  };
}

export async function getRecentTasks(limit: number = 5): Promise<Task[]> {
  const response = await fetchAPI<TaskListResponse>(`/tasks?limit=${limit}`);
  return response.tasks;
}

// ============================================================================
// Task API
// ============================================================================

export async function getTasks(params?: {
  status?: string;
  country?: string;
  page?: number;
  limit?: number;
}): Promise<TaskListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.country) searchParams.append('country', params.country);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const query = searchParams.toString();
  return fetchAPI<TaskListResponse>(`/tasks${query ? `?${query}` : ''}`);
}

export async function getTask(taskId: string): Promise<Task> {
  return fetchAPI<Task>(`/tasks/${taskId}`);
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  return fetchAPI<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTask(taskId: string, data: Partial<CreateTaskInput>): Promise<Task> {
  return fetchAPI<Task>(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ============================================================================
// Application API
// ============================================================================

export async function getTaskApplications(taskId: string): Promise<TaskApplication[]> {
  const response = await fetchAPI<{ applications: TaskApplication[] }>(`/applications/${taskId}`);
  return response.applications;
}

export async function assignTask(
  taskId: string,
  applicationId: string,
  adminNotes?: string,
): Promise<Assignment> {
  return fetchAPI<Assignment>(`/tasks/${taskId}/assign/${applicationId}`, {
    method: 'POST',
    body: JSON.stringify({ adminNotes }),
  });
}

export async function rejectApplication(applicationId: string, reason: string): Promise<void> {
  // TODO: Implement reject endpoint when available
  console.log('Rejecting application:', applicationId, reason);
}

// ============================================================================
// Assignment API
// ============================================================================

export async function getAssignment(assignmentId: string): Promise<Assignment> {
  return fetchAPI<Assignment>(`/assignments/${assignmentId}`);
}

export async function getAssignments(params?: {
  status?: string;
  ambassadorId?: string;
}): Promise<Assignment[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.ambassadorId) searchParams.append('ambassadorId', params.ambassadorId);

  const query = searchParams.toString();
  const response = await fetchAPI<{ assignments: Assignment[] }>(
    `/assignments${query ? `?${query}` : ''}`,
  );
  return response.assignments;
}

// ============================================================================
// Submission API
// ============================================================================

export async function getSubmission(submissionId: string): Promise<Submission> {
  return fetchAPI<Submission>(`/submissions/${submissionId}`);
}

export async function getSubmissions(): Promise<Submission[]> {
  const response = await fetchAPI<{ submissions: Submission[] }>('/submissions');
  return response.submissions;
}

export async function reviewSubmission(
  submissionId: string,
  review: ReviewSubmissionInput,
): Promise<void> {
  // TODO: Implement review endpoint when available
  return fetchAPI<void>(`/submissions/${submissionId}/review`, {
    method: 'POST',
    body: JSON.stringify(review),
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
