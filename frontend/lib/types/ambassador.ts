// ============================================================================
// Ambassador UI TypeScript Types
// ============================================================================

export type TaskStatus = 'DRAFT' | 'PUBLISHED' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type AssignmentStatus =
  | 'ASSIGNED'
  | 'AWAITING_SUBMISSION'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REVISION_REQUESTED'
  | 'COMPLETED';
export type StreamStatus = 'PENDING_CREATION' | 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'COMPLETED';

// ============================================================================
// Task Types (Browse Tasks)
// ============================================================================

export interface KPISummary {
  metric: string;
  target: number;
}

export interface TaskSummary {
  taskId: string;
  title: string;
  description: string;
  country: string;
  city?: string;
  budgetUSDC: number;
  eventStartDate: string;
  eventEndDate: string;
  applicationDeadline?: string;
  tags: string[];
  kpiSummary: string; // e.g., "50+ participants, 10+ projects"
  status: TaskStatus;
  applicationCount?: number;
  createdAt: string;
}

export interface TaskDetail {
  taskId: string;
  title: string;
  description: string;
  country: string;
  city?: string;
  language: string;
  budgetUSDC: number;
  applicationDeadline?: string;
  eventStartDate: string;
  eventEndDate: string;
  tags: string[];
  status: TaskStatus;
  kpiRequirements: KPIRequirement[];
  deliverableRequirements: DeliverableRequirement[];
  ecosystemId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KPIRequirement {
  kpiRequirementId: string;
  metric: string;
  target: number;
  description?: string;
}

export interface DeliverableRequirement {
  requirementId: string;
  type: 'PHOTO' | 'VIDEO' | 'REPORT' | 'SOCIAL_POST' | 'ARTICLE' | 'OTHER';
  description: string;
  minQuantity?: number;
}

// ============================================================================
// Application Types
// ============================================================================

export interface ApplicationInput {
  taskId: string;
  coverLetter: string;
  pastRelevantExperience?: string;
}

export interface Application {
  applicationId: string;
  taskId: string;
  ambassadorId: string;
  coverLetter: string;
  pastRelevantExperience?: string;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

// ============================================================================
// Assignment Types (My Tasks)
// ============================================================================

export interface AssignmentSummary {
  assignmentId: string;
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  ambassadorId: string;
  status: AssignmentStatus;
  eventEndDate: string;
  budgetUSDC: number;
  assignedAt: string;
  completedAt?: string;
}

export interface AssignmentDetail {
  assignmentId: string;
  taskId: string;
  ambassadorId: string;
  applicationId: string;
  status: AssignmentStatus;
  assignedAt: string;
  assignedBy: string;
  completedAt?: string;
  adminNotes?: string;
  task: TaskDetail;
  submission?: Submission;
}

// ============================================================================
// Submission Types (Task Execution)
// ============================================================================

export interface KPIValueInput {
  kpiRequirementId: string;
  actualValue: number;
  notes?: string;
}

export interface DeliverableInput {
  requirementId: string;
  type: 'PHOTO' | 'VIDEO' | 'REPORT' | 'SOCIAL_POST' | 'ARTICLE' | 'OTHER';
  fileUrl: string;
  notes?: string;
}

export interface SubmissionInput {
  kpiValues: KPIValueInput[];
  deliverables: DeliverableInput[];
  additionalNotes?: string;
}

export interface Submission {
  submissionId: string;
  assignmentId: string;
  kpiValues: KPIValue[];
  deliverables: DeliverableUpload[];
  additionalNotes?: string;
  submittedAt: string;
  submittedBy: string;
}

export interface KPIValue {
  kpiRequirementId: string;
  actualValue: number;
  notes?: string;
}

export interface DeliverableUpload {
  requirementId: string;
  type: 'PHOTO' | 'VIDEO' | 'REPORT' | 'SOCIAL_POST' | 'ARTICLE' | 'OTHER';
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  notes?: string;
  uploadedAt: string;
}

// ============================================================================
// StreamLink Types (Payments)
// ============================================================================

export interface StreamLink {
  id: string;
  assignmentId: string;
  stellarStreamId?: string; // Soroban contract stream ID
  contractId: string;
  assetCode: string; // e.g., USDC, XLM
  assetIssuer?: string;
  totalAmount: number;
  status: StreamStatus;
  createdAt: string;
  updatedAt: string;
  taskTitle?: string; // Optional, for display
  ambassadorId?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface TaskListResponse {
  tasks: TaskSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface AssignmentListResponse {
  assignments: AssignmentSummary[];
  total: number;
}

export interface StreamListResponse {
  streams: StreamLink[];
  total: number;
}
