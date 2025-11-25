/**
 * Ambassador Hub - Complete Type System
 *
 * This module defines all domain models for the Ambassador Hub feature.
 * Uses branded types for IDs to prevent mixing different entity IDs.
 */

// ============================================================================
// BRANDED ID TYPES (Prevents mixing TaskId with AmbassadorId, etc.)
// ============================================================================

type Brand<K, T> = K & { __brand: T };

export type TaskId = Brand<string, 'TaskId'>;
export type EcosystemId = Brand<string, 'EcosystemId'>;
export type KPIRequirementId = Brand<string, 'KPIRequirementId'>;
export type DeliverableRequirementId = Brand<string, 'DeliverableRequirementId'>;
export type AmbassadorId = Brand<string, 'AmbassadorId'>;
export type UserId = Brand<string, 'UserId'>;
export type ApplicationId = Brand<string, 'ApplicationId'>;
export type AssignmentId = Brand<string, 'AssignmentId'>;
export type SubmissionId = Brand<string, 'SubmissionId'>;
export type ReviewId = Brand<string, 'ReviewId'>;
export type StreamLinkId = Brand<string, 'StreamLinkId'>;
export type StellarStreamId = Brand<string, 'StellarStreamId'>;

// ============================================================================
// BASE INTERFACES
// ============================================================================

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Soft delete support
 */
export interface SoftDeletable {
  deletedAt?: Date;
  isDeleted: boolean;
}

// ============================================================================
// ENUMS & STATUS TYPES
// ============================================================================

export type TaskStatus =
  | 'DRAFT' // Task created but not published
  | 'PUBLISHED' // Open for applications
  | 'ASSIGNED' // Ambassador assigned
  | 'IN_PROGRESS' // Work in progress
  | 'SUBMITTED' // Submission received
  | 'COMPLETED' // Approved and paid
  | 'CANCELLED'; // Task cancelled

export type KPIType =
  | 'PARTICIPANTS' // Event attendance count
  | 'PROJECTS' // Projects built/presented
  | 'REGISTRATIONS' // Pre-registrations
  | 'HACKATHON_SUBMISSIONS' // Hackathon project submissions
  | 'CUSTOM'; // Custom metric

export type DeliverableType =
  | 'PHOTO' // Event photos
  | 'VIDEO' // Video content
  | 'ATTENDANCE_CSV' // Attendee list
  | 'REPORT' // Written report
  | 'SLIDES' // Presentation slides
  | 'OTHER'; // Other file types

export type ApplicationStatus =
  | 'PENDING' // Waiting for review
  | 'ACCEPTED' // Application approved
  | 'REJECTED' // Application denied
  | 'WITHDRAWN'; // Ambassador withdrew

export type AssignmentStatus =
  | 'ASSIGNED' // Ambassador assigned
  | 'IN_PROGRESS' // Work started
  | 'AWAITING_SUBMISSION' // Deadline approaching
  | 'UNDER_REVIEW' // Submission being reviewed
  | 'APPROVED' // Review approved
  | 'REJECTED' // Review rejected
  | 'PAID' // Payment completed
  | 'CANCELLED'; // Assignment cancelled

export type ReviewDecision =
  | 'APPROVED' // All KPIs met
  | 'REJECTED' // Failed requirements
  | 'CHANGES_REQUESTED'; // Needs revision

export type KPIStatus =
  | 'MET' // Target achieved
  | 'NOT_MET'; // Target missed

export type StreamStatus =
  | 'PENDING_CREATION' // Not yet created on blockchain
  | 'ACTIVE' // Stream running
  | 'PAUSED' // Temporarily stopped
  | 'CANCELLED' // Stream cancelled
  | 'COMPLETED'; // Fully paid out

export type StreamModel =
  | 'UPFRONT_CHUNK' // 50% upfront, 50% on completion
  | 'LINEAR_DURING_EVENT' // Stream during event duration
  | 'POST_EVENT' // Full payment after approval
  | 'HYBRID'; // Custom split

// ============================================================================
// 1. TASK (Core Event / Mission)
// ============================================================================

export interface Task extends BaseEntity, SoftDeletable {
  id: TaskId;
  ecosystemId: EcosystemId;

  // Basic Info
  title: string;
  description: string;

  // Location & Language
  country?: string;
  city?: string;
  language?: string;

  // Requirements
  kpiRequirements: KPIRequirement[];
  deliverableRequirements: DeliverableRequirement[];

  // Budget & Payment
  budgetUSDC: number;
  streamConfig?: StreamConfig;

  // Dates
  applicationDeadline?: Date;
  eventStartDate?: Date;
  eventEndDate?: Date;

  // Metadata
  tags: string[];
  status: TaskStatus;

  // Relations (populated)
  applications?: TaskApplication[];
  assignments?: Assignment[];
}

export interface StreamConfig {
  model: StreamModel;
  upfrontPercentage?: number; // For UPFRONT_CHUNK or HYBRID
  postEventPercentage?: number; // For HYBRID
  streamDuringEvent?: boolean; // For HYBRID
}

// ============================================================================
// 2. KPI REQUIREMENT
// ============================================================================

export interface KPIRequirement extends BaseEntity {
  id: KPIRequirementId;
  taskId: TaskId;

  type: KPIType;
  label: string;
  minValue: number;
  description?: string;

  // Validation
  isRequired: boolean;
  weight?: number; // For weighted scoring
}

// ============================================================================
// 3. DELIVERABLE REQUIREMENT
// ============================================================================

export interface DeliverableRequirement extends BaseEntity {
  id: DeliverableRequirementId;
  taskId: TaskId;

  type: DeliverableType;
  label: string;
  minCount?: number; // Min # of files
  minWords?: number; // For reports
  maxSizeMB?: number; // File size limit
  description?: string;

  isRequired: boolean;
}

// ============================================================================
// 4. AMBASSADOR PROFILE
// ============================================================================

export interface AmbassadorProfile extends BaseEntity, SoftDeletable {
  id: AmbassadorId;
  userId: UserId;

  // Profile Info
  displayName: string;
  bio?: string;
  avatarUrl?: string;

  // Location
  country?: string;
  city?: string;
  timezone?: string;

  // Skills & Experience
  skills: string[];
  languages: string[];
  pastEventsCount: number;
  avgRating?: number;
  totalEarned?: number; // Lifetime earnings in USDC

  // Badges & Achievements
  badges: string[];
  verifications: string[]; // 'EMAIL', 'PHONE', 'KYC'

  // Social Links
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    telegram?: string;
  };

  // Status
  isAvailable: boolean;
  isVerified: boolean;

  // Relations
  applications?: TaskApplication[];
  assignments?: Assignment[];
}

// ============================================================================
// 5. TASK APPLICATION
// ============================================================================

export interface TaskApplication extends BaseEntity {
  id: ApplicationId;
  taskId: TaskId;
  ambassadorId: AmbassadorId;

  // Application Content
  coverLetter?: string;
  pastRelevantExperience?: string;
  proposedApproach?: string;
  estimatedHours?: number;

  status: ApplicationStatus;
  rejectionReason?: string;

  // Relations
  task?: Task;
  ambassador?: AmbassadorProfile;
  assignment?: Assignment;
}

// ============================================================================
// 6. ASSIGNMENT
// ============================================================================

export interface Assignment extends BaseEntity {
  id: AssignmentId;
  taskId: TaskId;
  ambassadorId: AmbassadorId;
  applicationId: ApplicationId;

  status: AssignmentStatus;

  // Lifecycle Timestamps
  assignedAt: Date;
  startedAt?: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  paidAt?: Date;
  cancelledAt?: Date;

  // Cancellation
  cancellationReason?: string;

  // Payment
  streamLink?: StreamLink;

  // Relations
  task?: Task;
  ambassador?: AmbassadorProfile;
  application?: TaskApplication;
  submission?: Submission;
  review?: Review;
}

// ============================================================================
// 7. SUBMISSION
// ============================================================================

export interface Submission extends BaseEntity {
  id: SubmissionId;
  assignmentId: AssignmentId;

  // KPI Results
  kpiValues: KPIValue[];

  // Deliverables
  deliverables: DeliverableUpload[];

  // Additional Info
  notes?: string;
  submittedAt: Date;

  // Version control (for resubmissions)
  version: number;
  previousVersionId?: SubmissionId;

  // Relations
  assignment?: Assignment;
  review?: Review;
}

export interface KPIValue {
  id: string;
  submissionId: SubmissionId;
  kpiRequirementId: KPIRequirementId;
  actualValue: number;
  proofUrl?: string; // Link to proof (photo, spreadsheet, etc.)
  notes?: string;
}

export interface DeliverableUpload {
  id: string;
  submissionId: SubmissionId;
  requirementId: DeliverableRequirementId;

  type: DeliverableType;
  fileName: string;
  fileUrl: string;
  fileSizeMB: number;
  mimeType: string;

  metadata?: Record<string, any>; // Additional data (dimensions, duration, etc.)
  uploadedAt: Date;
}

// ============================================================================
// 8. REVIEW
// ============================================================================

export interface Review extends BaseEntity {
  id: ReviewId;
  assignmentId: AssignmentId;
  submissionId: SubmissionId;

  decision: ReviewDecision;
  reviewerId: UserId;

  // KPI Check Results
  kpiCheckResults: KPICheckResult[];

  // Feedback
  comments?: string;
  internalNotes?: string; // Not visible to ambassador

  // Scoring
  overallScore?: number; // 0-100

  // If changes requested
  changesRequested?: string[];
  resubmissionDeadline?: Date;
}

export interface KPICheckResult {
  kpiRequirementId: KPIRequirementId;
  actualValue: number;
  minValue: number;
  status: KPIStatus;
  notes?: string;
}

// ============================================================================
// 9. STREAM LINK (Bridge to StellarStream Contract)
// ============================================================================

export interface StreamLink extends BaseEntity {
  id: StreamLinkId;
  assignmentId: AssignmentId;

  // Stellar Blockchain Info
  stellarStreamId?: StellarStreamId; // ID in StellarStream contract
  contractId: string; // Soroban contract address

  // Asset Info
  assetCode: string; // 'USDC', 'XLM', etc.
  assetIssuer?: string; // Issuer address for custom assets

  // Amount & Config
  totalAmount: number;
  config: StreamConfig;

  // Status
  status: StreamStatus;

  // Stellar Transaction Hashes
  creationTxHash?: string;
  cancelTxHash?: string;

  // Withdrawals (tracking)
  withdrawals: StreamWithdrawal[];

  // Relations
  assignment?: Assignment;
}

export interface StreamWithdrawal {
  txHash: string;
  amount: number;
  withdrawnAt: Date;
  recipientAddress: string;
}

// ============================================================================
// HELPER TYPES & UTILITIES
// ============================================================================

/**
 * Task with computed fields
 */
export interface TaskWithStats extends Task {
  applicationsCount: number;
  assignedAmbassadorsCount: number;
  completionRate: number;
}

/**
 * Ambassador with computed stats
 */
export interface AmbassadorWithStats extends AmbassadorProfile {
  activeAssignments: number;
  completedTasks: number;
  successRate: number;
  avgDeliveryTime: number; // In hours
}

/**
 * Filters for task search
 */
export interface TaskFilters {
  status?: TaskStatus[];
  country?: string;
  minBudget?: number;
  maxBudget?: number;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Filters for ambassador search
 */
export interface AmbassadorFilters {
  country?: string;
  skills?: string[];
  languages?: string[];
  minRating?: number;
  isAvailable?: boolean;
  isVerified?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
