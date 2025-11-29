'use client';

import { ReactNode, useMemo, useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import { connectWallet } from '@/lib/stellar';

interface BuilderLayoutProps {
  children: ReactNode;
}

export default function BuilderLayout({ children }: BuilderLayoutProps) {
  const [walletAddress, setWalletAddress] = useState<string>(() => {
    // Lazy initialization - only runs once on mount
    if (typeof window !== 'undefined') {
      return localStorage.getItem('walletAddress') || '';
    }
    return '';
  });

  const userEmail = useMemo(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userEmail') || '';
    }
    return '';
  }, []);

  const handleWalletConnect = async () => {
    const address = await connectWallet();
    if (address) {
      setWalletAddress(address);
      localStorage.setItem('walletAddress', address);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar 
        userRole="builder" 
        walletAddress={walletAddress} 
        userEmail={userEmail}
        onConnectWallet={handleWalletConnect}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
