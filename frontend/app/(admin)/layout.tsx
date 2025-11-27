'use client';

import { ReactNode, useMemo } from 'react';
import Sidebar from '@/components/layouts/Sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const walletAddress = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

  const userEmail = useMemo(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userEmail') || '';
    }
    return '';
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar userRole="admin" walletAddress={walletAddress} userEmail={userEmail} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
