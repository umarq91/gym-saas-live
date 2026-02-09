'use client';

import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/next';
import { useAuthStore } from '@/lib/store/auth-store';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const loadAuthFromStorage = useAuthStore((state) => state.loadAuthFromStorage);

  // Initialize auth state from localStorage on app mount
  useEffect(() => {
    loadAuthFromStorage();
  }, [loadAuthFromStorage]);

  return (
    <>
      {children}
      <Toaster position="top-right" theme="dark" />
      <Analytics />
    </>
  );
}
