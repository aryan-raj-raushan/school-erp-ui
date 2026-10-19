'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptics';
import { useIsMobileSync } from '@/hooks/useIsMobileSync';

interface TabOption<T extends string> {
  value: T;
  label: string;
}

interface TabsProps<T extends string> {
  options: readonly TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ options, value, onChange, className }: TabsProps<T>) {
  const isMobile = useIsMobileSync();
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  React.useEffect(() => {
    if (!isMobile) return;
    tabRefs.current[value]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [value, isMobile]);

  return (
    <div
      role="tablist"
      className={cn(
        'flex rounded-lg bg-muted p-1',
        isMobile && 'gap-1 overflow-x-auto rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          ref={(node) => {
            tabRefs.current[opt.value] = node;
          }}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => {
            if (opt.value !== value) void haptic('light');
            onChange(opt.value);
          }}
          className={cn(
            'flex-1 rounded-md py-1.5 text-sm font-medium transition-colors',
            isMobile && 'min-h-10 shrink-0 whitespace-nowrap rounded-xl px-4 active:scale-95',
            value === opt.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
