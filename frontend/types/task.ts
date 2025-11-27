export type TaskType =
  | 'Workshop'
  | 'Hackathon'
  | 'Meetup'
  | 'Part-time Job'
  | 'Full-time Job'
  | 'Hourly Job';

export type TaskStatus = 'Open' | 'Closed' | 'In Progress';

export interface KPI {
  id?: string;
  name: string;
  target: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  location?: string; // Only for Workshop, Hackathon, Meetup
  date?: string; // Only for Workshop, Hackathon, Meetup
  budget: number;
  status: TaskStatus;
  kpis: KPI[];
  currentApplicants?: number;
  maxApplicants?: number;
  createdAt: string;
  updatedAt: string;
}
