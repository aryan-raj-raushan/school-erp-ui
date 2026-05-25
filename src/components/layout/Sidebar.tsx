'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { NAV_ITEMS, NAV_LABELS, APP } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { NavIcon } from './NavIcon';

export function Sidebar() {
  const pathname = usePathname();
  const { logout, isLoading } = useAuth();
  const user = useAuthStore((s) => s.user);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role)),
  );

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">{APP.name}</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === item.href
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50'
            }`}
          >
            <NavIcon name={item.iconKey} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-200 dark:border-zinc-800">
        {user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50 truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-zinc-500 truncate">{user.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          disabled={isLoading}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors disabled:opacity-50"
        >
          <LogOut size={18} />
          {NAV_LABELS.signOut}
        </button>
      </div>
    </aside>
  );
}
