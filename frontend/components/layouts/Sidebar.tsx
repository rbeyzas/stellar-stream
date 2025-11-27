'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import WalletConnect from '@/components/WalletConnect';
import {
  LayoutDashboard,
  Users,
  User,
  DollarSign,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
  TrendingUp,
  UserCheck,
  Gift,
  FileText,
  ListTodo,
  FileCheck,
} from 'lucide-react';
import { UserRole } from '@/types/role';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  // Admin menu items
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    roles: ['admin'],
  },
  {
    name: 'Builders',
    href: '/admin/builders',
    icon: Users,
    roles: ['admin'],
  },
  {
    name: 'Campaigns',
    href: '/admin/campaigns',
    icon: Gift,
    roles: ['admin'],
  },
  {
    name: 'Tasks',
    href: '/admin/tasks',
    icon: FileText,
    roles: ['admin'],
  },
  {
    name: 'Applications',
    href: '/admin/applications',
    icon: UserCheck,
    roles: ['admin'],
  },
  {
    name: 'Submissions',
    href: '/admin/submissions',
    icon: FileText,
    roles: ['admin'],
  },
  {
    name: 'Payments',
    href: '/admin/payments',
    icon: DollarSign,
    roles: ['admin'],
  },
  // {
  //   name: 'Reports',
  //   href: '/admin/reports',
  //   icon: FileText,
  //   roles: ['admin'],
  // },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    roles: ['admin'],
  },

  // Builder menu items
  {
    name: 'Dashboard',
    href: '/builder/dashboard',
    icon: LayoutDashboard,
    roles: ['builder'],
  },
  {
    name: 'Browse Tasks',
    href: '/builder/tasks',
    icon: ListTodo,
    roles: ['builder'],
  },
  {
    name: 'My Applications',
    href: '/builder/my-applications',
    icon: FileCheck,
    roles: ['builder'],
  },
  {
    name: 'My Tasks',
    href: '/builder/my-tasks',
    icon: ListTodo,
    roles: ['builder'],
  },
  {
    name: 'My Campaigns',
    href: '/builder/campaigns',
    icon: Gift,
    roles: ['builder'],
  },
  {
    name: 'Referrals',
    href: '/builder/referrals',
    icon: UserCheck,
    roles: ['builder'],
  },
  {
    name: 'Earnings',
    href: '/builder/earnings',
    icon: DollarSign,
    roles: ['builder'],
  },
  {
    name: 'Wallet',
    href: '/builder/wallet',
    icon: Wallet,
    roles: ['builder'],
  },
  {
    name: 'Profile',
    href: '/builder/profile',
    icon: User,
    roles: ['builder'],
  },
  {
    name: 'Settings',
    href: '/builder/settings',
    icon: Settings,
    roles: ['builder'],
  },
];

interface SidebarProps {
  userRole: UserRole;
  walletAddress?: string;
  userEmail?: string;
}

export default function Sidebar({
  userRole,
  walletAddress: initialWalletAddress,
  userEmail,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(initialWalletAddress);
  const pathname = usePathname();

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <div
      className={cn(
        'relative flex flex-col h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 text-white transition-all duration-300',
        collapsed ? 'w-20' : 'w-64',
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-6 border-b border-purple-700/50">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200">
              Stellar Stream
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-purple-700/50 transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* User Role Badge */}
      {!collapsed && (
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3 p-3 bg-purple-800/50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {userRole === 'admin' ? 'A' : 'B'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium capitalize">{userRole}</p>
              {userEmail && <p className="text-xs text-purple-300 truncate">{userEmail}</p>}
              {walletAddress && (
                <p className="text-xs text-purple-300">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50'
                  : 'hover:bg-purple-700/50',
                collapsed && 'justify-center',
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-purple-700/50 space-y-3">
        {/* Wallet Connect */}
        {!collapsed && (
          <div className="px-2">
            <WalletConnect
              onConnect={(address) => {
                setWalletAddress(address);
                console.log('Wallet connected:', address);
              }}
            />
          </div>
        )}

        <button
          onClick={() => {
            // Handle logout
            console.log('Logout clicked');
          }}
          className={cn(
            'flex items-center space-x-3 px-4 py-3 w-full rounded-lg hover:bg-red-500/20 transition-colors',
            collapsed && 'justify-center',
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
