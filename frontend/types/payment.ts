export type PaymentStatus = 'Pending Approval' | 'Processing' | 'Completed' | 'Failed';

export interface Payment {
  id: string;
  builderId: string;
  builderName: string;
  builderEmail: string;
  builderAvatar: string;
  submissionId: string;
  taskId: string;
  taskTitle: string;
  taskDate: string;
  amount: number;
  status: PaymentStatus;
  submittedAt: string;
  approvedAt?: string;
  paidAt?: string;
  transactionHash?: string;
}
