// ============================================================================
// Ambassador API Client
// ============================================================================

import {
  TaskSummary,
  TaskDetail,
  ApplicationInput,
  Application,
  AssignmentSummary,
  AssignmentDetail,
  SubmissionInput,
  Submission,
  StreamLink,
  TaskListResponse,
  AssignmentListResponse,
  StreamListResponse,
} from '@/lib/types/ambassador';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============================================================================
// Helper Functions
// ============================================================================

function getAuthToken(): string {
  // TODO: Replace with real JWT token from auth context/localStorage
  return 'fake-ambassador-token-for-development';
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

// ============================================================================
// Browse Tasks API
// ============================================================================

export async function getOpenTasks(params?: {
  page?: number;
  limit?: number;
  country?: string;
  tags?: string[];
}): Promise<TaskListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.country) queryParams.set('country', params.country);
  if (params?.tags?.length) queryParams.set('tags', params.tags.join(','));

  const response = await fetch(`${API_BASE_URL}/tasks/open?${queryParams}`);
  return handleResponse<TaskListResponse>(response);
}

export async function getTaskDetail(taskId: string): Promise<TaskDetail> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
  return handleResponse<TaskDetail>(response);
}

export async function applyToTask(input: ApplicationInput): Promise<Application> {
  const response = await fetch(`${API_BASE_URL}/tasks/${input.taskId}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      coverLetter: input.coverLetter,
      pastRelevantExperience: input.pastRelevantExperience,
    }),
  });
  return handleResponse<Application>(response);
}

// ============================================================================
// My Tasks API
// ============================================================================

export async function getMyAssignments(params?: {
  status?: string;
}): Promise<AssignmentListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set('status', params.status);

  const response = await fetch(`${API_BASE_URL}/assignments?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  return handleResponse<AssignmentListResponse>(response);
}

export async function getMyApplications(): Promise<Application[]> {
  const response = await fetch(`${API_BASE_URL}/applications/me`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  return handleResponse<Application[]>(response);
}

// ============================================================================
// Task Execution API
// ============================================================================

export async function getAssignmentDetail(assignmentId: string): Promise<AssignmentDetail> {
  const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  return handleResponse<AssignmentDetail>(response);
}

export async function submitAssignment(
  assignmentId: string,
  input: SubmissionInput,
): Promise<Submission> {
  const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(input),
  });
  return handleResponse<Submission>(response);
}

// ============================================================================
// Payments/Streams API
// ============================================================================

export async function getMyStreams(): Promise<StreamListResponse> {
  const response = await fetch(`${API_BASE_URL}/streams/me`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  return handleResponse<StreamListResponse>(response);
}

export async function getStreamByAssignment(assignmentId: string): Promise<StreamLink | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/streams/assignment/${assignmentId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse<StreamLink>(response);
  } catch {
    return null;
  }
}

// ============================================================================
// Helper Functions for Display
// ============================================================================

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

export function formatCurrency(amount: number, currency = 'USDC'): string {
  return `${amount.toLocaleString()} ${currency}`;
}

export function generateKPISummary(kpis: Array<{ metric: string; target: number }>): string {
  if (kpis.length === 0) return 'No KPIs';
  return kpis.map((kpi) => `${kpi.target}+ ${kpi.metric}`).join(', ');
}
