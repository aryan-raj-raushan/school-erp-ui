'use client';

import React, { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResponsiveDropdownContainer, useIsMobile } from './responsive-bottom-sheet';

interface ResponsiveSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: ReadonlyArray<{ value: string; label: string }>;
  customPlaceholder?: string;
}

export const ResponsiveSelect = React.forwardRef<
  HTMLSelectElement,
  ResponsiveSelectProps
>(
  (
    {
      label,
      error,
      hint,
      options = [],
      customPlaceholder,
      className,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const isMobile = useIsMobile();
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || '');
    const selectRef = useRef<HTMLSelectElement>(null);

    const handleMobileSelect = (val: string) => {
      setSelectedValue(val);
      setIsBottomSheetOpen(false);
      if (onChange) {
        const event = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', {
          writable: false,
          value: { value: val },
        });
        onChange(event as any);
      }
    };

    const selectedLabel =
      options.find((opt) => opt.value === selectedValue)?.label ||
      customPlaceholder ||
      'Select...';

    return (
      <>
        {isMobile && (
          <ResponsiveDropdownContainer
            isOpen={isBottomSheetOpen}
            onClose={() => setIsBottomSheetOpen(false)}
            title={label}
            className="bottom-sheet-dropdown"
          >
            <div className="space-y-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMobileSelect(option.value)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg border border-border transition-colors',
                    selectedValue === option.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted/50',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </ResponsiveDropdownContainer>
        )}

        <div>
          {label && <label className="block text-sm font-medium mb-2">{label}</label>}

          {isMobile ? (
            // Mobile: Button trigger for bottom sheet
            <button
              type="button"
              onClick={() => setIsBottomSheetOpen(true)}
              className={cn(
                'w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-left text-sm flex items-center justify-between',
                error && 'border-destructive',
              )}
            >
              <span>{selectedLabel}</span>
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
          ) : (
            // Desktop: Native select
            <select
              ref={ref || selectRef}
              value={selectedValue}
              onChange={(e) => {
                setSelectedValue(e.target.value);
                if (onChange) onChange(e);
              }}
              className={cn(
                'w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                error && 'border-destructive focus:ring-destructive',
                className,
              )}
              {...props}
            >
              <option value="">{customPlaceholder || 'Select...'}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          {hint && !error && <p className="text-sm text-muted-foreground mt-1">{hint}</p>}
        </div>
      </>
    );
  },
);

ResponsiveSelect.displayName = 'ResponsiveSelect';
