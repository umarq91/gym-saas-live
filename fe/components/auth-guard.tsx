'use client';

import { useEffect, ReactNode, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated, validateToken } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const hasValidated = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for hydration first
      if (!isHydrated) {
        return;
      }

      // If we have a token, validate it (only once)
      if (isAuthenticated && !hasValidated.current) {
        hasValidated.current = true;
        const isValid = await validateToken();

        if (!isValid) {
          hasValidated.current = false;
          router.push('/login');
          setIsValidating(false);
          return;
        }
      } else if (!isAuthenticated) {
        // No token, redirect to login
        hasValidated.current = false;
        router.push('/login');
        setIsValidating(false);
        return;
      }

      // Check role-based access
      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        setIsValidating(false);
        return;
      }

      setIsValidating(false);
    };

    checkAuth();
  }, [isHydrated, isAuthenticated, allowedRoles, router]);

  // Show loading while hydrating or validating
  if (!isHydrated || isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if role not allowed
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
