export type UserRole = 'admin' | 'builder';

export interface User {
  walletAddress: string;
  role: UserRole;
  name?: string;
  email?: string;
}
