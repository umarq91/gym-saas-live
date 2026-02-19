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

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <aside className="w-60 bg-card/80 backdrop-blur-xl border-r border-border/50 h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="bg-primary rounded-lg p-1.5">
            <Dumbbell className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold text-foreground tracking-tight">FitFlow</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary ml-0'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="px-3 py-4 border-t border-border/50 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name || user?.email}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
        </div>
        <Button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-9 text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
