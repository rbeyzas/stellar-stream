'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WalletConnect from '@/components/WalletConnect';
import { motion } from 'framer-motion';
import { Sparkles, Users, TrendingUp, Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Geçici rol kontrolü fonksiyonu
  const checkUserRole = (): 'admin' | 'ambassador' | null => {
    // TODO: Backend API'den rol bilgisi alınacak
    // Şimdilik demo için random rol atama
    return null; // Null döndürerek landing page'de kalmasını sağlıyoruz
  };

  useEffect(() => {
    // Wallet bağlandığında role göre yönlendir
    if (walletAddress) {
      // TODO: Gerçek rol kontrolü backend'den yapılacak
      // Şimdilik test için admin olarak yönlendirelim
      const userRole = checkUserRole();

      if (userRole === 'admin') {
        router.push('/admin/dashboard');
      } else if (userRole === 'ambassador') {
        router.push('/ambassador/dashboard');
      }
    }
  }, [walletAddress, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-white">Stellar Stream</span>
            </div>
            <WalletConnect onConnect={(address) => setWalletAddress(address)} />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-white text-sm font-medium">Powered by Stellar Blockchain</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Ambassador Program
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
                Management Platform
              </span>
            </h1>

            <p className="text-xl text-purple-200 mb-12 max-w-2xl mx-auto">
              Empower your brand with our comprehensive ambassador management system. Track
              performance, manage campaigns, and automate payments with blockchain technology.
            </p>

            {!walletAddress && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center"
              >
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
                  <p className="text-white mb-4 text-lg">Connect your wallet to get started</p>
                  <WalletConnect onConnect={(address) => setWalletAddress(address)} />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
          >
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Ambassador Management</h3>
              <p className="text-purple-200">
                Easily onboard, track, and manage your ambassador network in one place.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Real-time Analytics</h3>
              <p className="text-purple-200">
                Monitor performance metrics and campaign results with detailed analytics.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Automated Payments</h3>
              <p className="text-purple-200">
                Secure, transparent, and automated payments powered by Stellar blockchain.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 py-8">
        <div className="container mx-auto px-6">
          <div className="text-center text-purple-300">
            <p>&copy; 2024 Stellar Stream. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
