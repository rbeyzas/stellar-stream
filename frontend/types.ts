export type StreamStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Stream {
  id: string;
  sender: string;
  recipient: string;
  startTime: number;
  stopTime: number;
  ratePerSecond: number;
  deposit: number;
  remainingBalance?: number;
  withdrawn: number;
  tokenAddress: string;
  isOptimistic?: boolean;
  status?: StreamStatus;
  isCancelled?: boolean;
}
