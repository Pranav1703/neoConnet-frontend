'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasLocalToken = window.localStorage.getItem('token');
    const hasCookieToken = typeof document !== 'undefined' && document.cookie.split(';').some(c => c.trim().startsWith('token='));
    const isAuthenticated = !!hasLocalToken || !!hasCookieToken;

    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">NeoConnect</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}