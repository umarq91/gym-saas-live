'use client';

import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/theme-provider';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
      {children}
      <Toaster position="top-right" theme="system" richColors />
      <Analytics />
    </ThemeProvider>
  );
}
