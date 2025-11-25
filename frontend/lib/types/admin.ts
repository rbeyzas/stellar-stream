// ============================================================================
// Admin UI TypeScript Types
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

// ============================================================================
// Task Types
// ============================================================================

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

export interface Task {
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
  ecosystemId?: string;
  kpiRequirements: KPIRequirement[];
  deliverableRequirements: DeliverableRequirement[];
  createdBy: string;
  assignedAmbassadorId?: string;
  createdAt: string;
  updatedAt: string;
  applicationCount?: number;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  country: string;
  city?: string;
  language: string;
  budgetUSDC: number;
  applicationDeadline?: string;
  eventStartDate: string;
  eventEndDate: string;
  tags?: string[];
  ecosystemId?: string;
  kpiRequirements: Omit<KPIRequirement, 'kpiRequirementId'>[];
  deliverableRequirements: Omit<DeliverableRequirement, 'requirementId'>[];
  publish?: boolean;
}

// ============================================================================
// Application Types
// ============================================================================

export interface TaskApplication {
  applicationId: string;
  taskId: string;
  ambassadorId: string;
  coverLetter: string;
  pastRelevantExperience?: string;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  task?: Task;
}

// ============================================================================
// Assignment Types
// ============================================================================

export interface Assignment {
  assignmentId: string;
  taskId: string;
  ambassadorId: string;
  applicationId: string;
  status: AssignmentStatus;
  assignedAt: string;
  assignedBy: string;
  completedAt?: string;
  adminNotes?: string;
  task?: Task;
  application?: TaskApplication;
}

// ============================================================================
// Submission Types
// ============================================================================

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

export interface Submission {
  submissionId: string;
  assignmentId: string;
  kpiValues: KPIValue[];
  deliverables: DeliverableUpload[];
  additionalNotes?: string;
  submittedAt: string;
  submittedBy: string;
  assignment?: Assignment;
  task?: Task;
}

// ============================================================================
// Dashboard Stats
// ============================================================================

export interface DashboardStats {
  activeTasks: number;
  pendingSubmissions: number;
  assignedTasks: number;
  completedTasks: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TaskListResponse {
  tasks: Task[];
  pagination: PaginationMeta;
}

export interface ApplicationListResponse {
  applications: TaskApplication[];
}

export interface AssignmentListResponse {
  assignments: Assignment[];
}

// ============================================================================
// Form Types
// ============================================================================

export interface KPIFormData {
  id: string; // Temporary client-side ID
  metric: string;
  target: number;
  description?: string;
}

export interface DeliverableFormData {
  id: string; // Temporary client-side ID
  type: 'PHOTO' | 'VIDEO' | 'REPORT' | 'SOCIAL_POST' | 'ARTICLE' | 'OTHER';
  description: string;
  minQuantity?: number;
}

export interface TaskFormData {
  title: string;
  description: string;
  country: string;
  city: string;
  language: string;
  budgetUSDC: string;
  applicationDeadline: string;
  eventStartDate: string;
  eventEndDate: string;
  tags: string;
  ecosystemId: string;
  kpiRequirements: KPIFormData[];
  deliverableRequirements: DeliverableFormData[];
}

// ============================================================================
// Review Types
// ============================================================================

export type ReviewDecision = 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';

export interface ReviewSubmissionInput {
  decision: ReviewDecision;
  comment: string;
}
