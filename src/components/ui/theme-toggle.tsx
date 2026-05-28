'use client';

import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  collapsed?: boolean;
  className?: string;
}

export function ThemeToggle({ collapsed, className }: ThemeToggleProps) {
  const { mode, toggleMode } = useThemeStore();

  return (
    <button
      onClick={toggleMode}
      title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors',
        collapsed && 'justify-center px-2',
        className,
      )}
    >
      <span className="shrink-0">
        {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </span>
      {!collapsed && (
        <span>{mode === 'light' ? 'Dark mode' : 'Light mode'}</span>
      )}
    </button>
  );
}
