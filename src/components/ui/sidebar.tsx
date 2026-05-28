import * as React from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
}

export function Sidebar({ collapsed, className, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 ease-in-out shrink-0',
        collapsed ? 'w-14' : 'w-60',
        className,
      )}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-5 border-b border-sidebar-border',
        className,
      )}
      {...props}
    />
  );
}

export function SidebarBrand({
  collapsed,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { collapsed?: boolean }) {
  return (
    <span
      className={cn(
        'font-bold text-sidebar-foreground transition-all duration-200',
        collapsed ? 'text-base' : 'text-base',
        className,
      )}
      {...props}
    />
  );
}

export function SidebarToggle({
  collapsed,
  onToggle,
  className,
}: {
  collapsed?: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onToggle}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className={cn(
        'ml-auto flex items-center justify-center rounded-md p-1.5 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
        className,
      )}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className={cn('transition-transform duration-200', collapsed && 'rotate-180')}
      >
        <path
          d="M9 2L4 7L9 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-3 py-3 border-t border-sidebar-border space-y-1', className)}
      {...props}
    />
  );
}

export function SidebarUserInfo({
  collapsed,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { collapsed?: boolean }) {
  if (collapsed) return null;
  return <div className={cn('px-3 py-2', className)} {...props} />;
}

export function DashboardShell({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex h-screen overflow-hidden bg-background', className)}
      {...props}
    />
  );
}

export function DashboardMain({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <main className={cn('flex-1 overflow-y-auto p-8', className)} {...props} />;
}
