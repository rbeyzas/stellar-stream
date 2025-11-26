'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/layouts/Sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Bu kısım daha sonra gerçek kullanıcı bilgisi ile değiştirilecek
  const walletAddress = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar userRole="admin" walletAddress={walletAddress} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
