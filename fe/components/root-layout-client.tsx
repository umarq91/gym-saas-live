'use client';

import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/next';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-right" theme="dark" />
      <Analytics />
    </>
  );
}
