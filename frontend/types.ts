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
}
