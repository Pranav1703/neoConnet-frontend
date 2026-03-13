'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const publicPaths = ['/login', '/register'];

const navigation = {
  staff: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Submit Case', href: '/cases/new' },
    { name: 'My Cases', href: '/cases' },
    { name: 'Polls', href: '/polls' },
    { name: 'Public Hub', href: '/public' },
  ],
  case_manager: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'My Cases', href: '/cases' },
    { name: 'Public Hub', href: '/public' },
  ],
  secretariat: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'All Cases', href: '/cases' },
    { name: 'Create Poll', href: '/polls/new' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Public Hub', href: '/public' },
  ],
  admin: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'All Cases', href: '/cases' },
    { name: 'Create Poll', href: '/polls/new' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Public Hub', href: '/public' },
  ],
  management: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'All Cases', href: '/cases' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Public Hub', href: '/public' },
  ],
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      router.push('/login');
    }
  }, [user, loading, router, isPublicPage]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Public pages without sidebar
  if (isPublicPage || isAuthPage) {
    return <>{children}</>;
  }

  // Authenticated pages with sidebar
  if (!user) {
    return <>{children}</>;
  }

  const navItems = navigation[user.role] || navigation.staff;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">NeoConnect</h1>
          <p className="text-sm text-muted-foreground">{user.role.replace('_', ' ')}</p>
        </div>
        <nav className="px-4 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-4 py-2 rounded-md text-sm font-medium mb-1",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-gray-100"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="mb-4">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.department}</p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
          >
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}