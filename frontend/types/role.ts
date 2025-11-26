export type UserRole = 'admin' | 'ambassador';

export interface User {
  walletAddress: string;
  role: UserRole;
  name?: string;
  email?: string;
}
