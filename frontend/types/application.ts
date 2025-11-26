export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Under Review';

export interface Application {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantAvatar?: string;
  taskId: string;
  taskTitle: string;
  taskType: string;
  taskLocation: string;
  taskDate: string;
  taskBudget: number;
  coverLetter: string;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  reviewedBy?: string;
}

export interface ApplicantProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  memberSince: string;
  completedTasks: number;
  totalEarnings: number;
  bio: string;
  skills?: string[];
  portfolio?: string[];
}
