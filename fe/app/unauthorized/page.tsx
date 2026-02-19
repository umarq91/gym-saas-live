'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-destructive/10 rounded-full mb-4">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground">
            You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
          </p>
        </div>

        <div className="space-y-2">
          <Link href="/dashboard" className="block">
            <Button className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/settings" className="block">
            <Button variant="outline" className="w-full">
              View Settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
