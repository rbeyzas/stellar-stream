export type SubmissionStatus = 'Pending Review' | 'Approved' | 'Rejected' | 'Revision Requested';

export interface KPIResult {
  name: string;
  target: string;
  achieved: string;
  status: 'Achieved' | 'Not Achieved' | 'Partially Achieved';
}

export interface SupportingFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface Submission {
  id: string;
  builderId: string;
  builderName: string;
  builderEmail: string;
  builderAvatar?: string;
  taskId: string;
  taskTitle: string;
  taskLocation: string;
  taskDate: string;
  taskBudget: number;
  workSummary: string;
  kpiResults: KPIResult[];
  supportingFiles: SupportingFile[];
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  paymentAmount?: number;
  // Performance metrics from builder
  completedTasks: number;
  totalEarnings: number;
  successRate: number;
  qualityScore: number;
}
