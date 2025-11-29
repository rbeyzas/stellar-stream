export type StreamStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';

export interface Stream {
  id: string;
  sender: string;
  recipient: string;
  deposit: number;
  ratePerSecond: number;
  remainingBalance: number;
  totalAccrued: number;
  lastUpdateTime: number;
  isRunning: boolean;
  isCancelled: boolean;
  tokenAddress: string;
  withdrawn: number;
  
  // Legacy/Derived fields for UI compatibility
  startTime: number; // Mapped to lastUpdateTime or creation time
  stopTime: number;  // Calculated or MaxInt
  status?: StreamStatus;
  isOptimistic?: boolean;
}
