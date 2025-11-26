export type TaskType = 'Workshop' | 'Hackathon' | 'Meetup' | 'Conference' | 'Other';
export type TaskStatus = 'Open' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  location: string;
  date: string;
  budget: number;
  maxApplicants: number;
  currentApplicants: number;
  description?: string;
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
}
