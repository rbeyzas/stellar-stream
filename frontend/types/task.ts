export type TaskType =
  | 'Workshop'
  | 'Hackathon'
  | 'Meetup'
  | 'Part-time Job'
  | 'Full-time Job'
  | 'Hourly Job';

export type TaskStatus = 'Open' | 'Closed' | 'In Progress' | 'Pending Stream Start';

export interface KPI {
  id?: string;
  name: string;
  target: string;
  description?: string;
}

export interface Application {
  id: string;
  taskId: string;
  builderId: string;
  builderEmail: string;
  builderName: string | null;
  coverLetter: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  location?: string; // Only for Workshop, Hackathon, Meetup
  date?: string; // Only for Workshop, Hackathon, Meetup
  budget: number;
  streamDuration?: number;
  streamId?: string;
  status: TaskStatus;
  kpis: KPI[];
  applications?: Application[];
  currentApplicants?: number;
  maxApplicants?: number;
  createdAt: string;
  updatedAt: string;
}
