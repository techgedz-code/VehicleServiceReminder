'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth/client';

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession();
        if (session) {
          // Already logged in, redirect to dashboard
          window.location.href = '/dashboard';
        }
      } catch {
        // Not logged in, continue
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return <>{children}</>;
}