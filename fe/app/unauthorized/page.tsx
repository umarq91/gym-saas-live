'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/20 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">Access Denied</h1>
          <p className="text-text-muted">
            You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard" className="block">
            <Button className="w-full bg-primary hover:bg-primary-dark text-white gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/settings" className="block">
            <Button variant="outline" className="w-full bg-transparent">
              View Settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
