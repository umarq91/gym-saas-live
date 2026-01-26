'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Settings,
  Dumbbell,
  LogOut,
  Building,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['OWNER', 'STAFF', 'SUPER_USER'],
  },
  {
    label: 'Members',
    href: '/members',
    icon: Users,
    allowedRoles: ['OWNER', 'STAFF', 'SUPER_USER'],
  },
  {
    label: 'Attendance',
    href: '/attendance',
    icon: Calendar,
    allowedRoles: ['OWNER', 'STAFF', 'SUPER_USER'],
  },
  {
    label: 'Fees',
    href: '/fees',
    icon: DollarSign,
    allowedRoles: ['OWNER', 'STAFF', 'SUPER_USER'],
  },
  {
    label: 'Gym',
    href: '/gym',
    icon: Building,
    allowedRoles: ['OWNER', 'SUPER_USER'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    allowedRoles: ['OWNER', 'STAFF', 'SUPER_USER'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const visibleItems = menuItems.filter((item) =>
    user?.role ? item.allowedRoles.includes(user.role) : false
  );

  return (
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg group-hover:shadow-lg group-hover:shadow-primary/50 transition-all">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-text">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FitFlow
              </span>
            </h1>
            <p className="text-xs text-text-muted">GymOS</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-text-muted hover:text-text hover:bg-surface/50'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="bg-surface/50 rounded-lg p-3">
          <p className="text-xs text-text-muted">Logged in as</p>
          <p className="text-sm font-semibold text-text truncate">{user?.name || user?.email}</p>
          <p className="text-xs text-text-muted">{user?.role}</p>
        </div>
        <Button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
