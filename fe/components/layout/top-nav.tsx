'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/members': 'Members Management',
  '/attendance': 'Attendance Tracking',
  '/fees': 'Fees Management',
  '/gym': 'Gym Management',
  '/settings': 'Settings',
};

export function TopNav() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'Dashboard';

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      {/* Page Title & Breadcrumb */}
      <div>
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Manage your gym operations efficiently
        </p>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden md:block relative w-48">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-text-muted" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 bg-surface border-border text-text text-sm"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative text-text-muted hover:text-text">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
        </Button>
      </div>
    </header>
  );
}
