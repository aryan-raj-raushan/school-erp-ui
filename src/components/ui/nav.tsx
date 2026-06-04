import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavProps extends React.HTMLAttributes<HTMLElement> {
  padding?: string;
}

export function Nav({ className, padding, ...props }: NavProps) {
  return (
    <nav
      className={cn('flex-1 overflow-y-auto px-3 py-4 space-y-1', padding, className)}
      {...props}
    />
  );
}

interface NavItemProps {
  href: string;
  active?: boolean;
  icon?: React.ReactNode;
  collapsed?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function NavItem({ href, active, icon, collapsed, children, className }: NavItemProps) {
  return (
    <Link
      href={href}
      title={collapsed ? String(children) : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        collapsed && 'justify-center px-2',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
        className,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {!collapsed && <span>{children}</span>}
    </Link>
  );
}

interface NavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  collapsed?: boolean;
  children: React.ReactNode;
}

export function NavButton({ icon, collapsed, children, className, ...props }: NavButtonProps) {
  return (
    <button
      title={collapsed ? String(children) : undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors disabled:opacity-50',
        collapsed && 'justify-center px-2',
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {!collapsed && <span>{children}</span>}
    </button>
  );
}
