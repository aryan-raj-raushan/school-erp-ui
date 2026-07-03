'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, inputBase } from './form';
import { ResponsiveDropdownContainer, useIsMobile } from './responsive-bottom-sheet';

type SelectWidth = 'full' | 'auto' | 'xs' | 'sm' | 'md';

const widthMap: Record<SelectWidth, string> = {
  full: 'w-full',
  auto: 'w-auto max-w-full',
  xs: 'w-20 max-w-full',
  sm: 'w-32 max-w-full',
  md: 'w-48 max-w-full',
};

interface ResponsiveSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  width?: SelectWidth;
  options?: ReadonlyArray<{ value: string; label: string }>;
  customPlaceholder?: string;
}

/**
 * A drop-in replacement for the design system's `Select` that never renders
 * a native browser dropdown — a custom popover listbox on desktop, a bottom
 * sheet on mobile. A real (visually hidden) `<select>` is always mounted as
 * the source of truth, so this stays compatible with any form library
 * (react-hook-form's `register()` included) that reads/writes a field
 * through a ref rather than a controlled `value`. The custom UI reads from,
 * and writes back to, that same underlying element.
 */
export const ResponsiveSelect = React.forwardRef<
  HTMLSelectElement,
  ResponsiveSelectProps
>(
  (
    {
      label,
      error,
      hint,
      width = 'full',
      options = [],
      customPlaceholder,
      className,
      disabled,
      ...props
    },
    forwardedRef,
  ) => {
    const isMobile = useIsMobile();
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLSelectElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [displayValue, setDisplayValue] = useState('');

    // Re-sync after every render so this reflects both user interaction and
    // programmatic changes (e.g. react-hook-form's reset()/setValue()).
    useEffect(() => {
      setDisplayValue(selectRef.current?.value ?? '');
    });

    // Close the desktop popover on outside click.
    useEffect(() => {
      if (isMobile || !isOpen) return;
      function handleClickOutside(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, isOpen]);

    function setRefs(node: HTMLSelectElement | null) {
      selectRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLSelectElement | null>).current = node;
      }
    }

    function selectValue(val: string) {
      const select = selectRef.current;
      if (!select) return;
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        'value',
      )?.set;
      nativeSetter?.call(select, val);
      select.dispatchEvent(new Event('change', { bubbles: true }));
      setIsOpen(false);
    }

    const selectedLabel =
      options.find((opt) => opt.value === displayValue)?.label ||
      customPlaceholder ||
      'Select...';

    return (
      <div ref={containerRef} className={cn('relative', widthMap[width])}>
        {label && <label className="block text-sm font-medium mb-2">{label}</label>}

        {/* Always mounted — the single source of truth for value/ref/form wiring */}
        <Select
          ref={setRefs}
          error={error}
          width={width}
          disabled={disabled}
          className={cn('sr-only absolute pointer-events-none', className)}
          {...props}
        >
          <option value="">{customPlaceholder || 'Select...'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <button
          type="button"
          onClick={() => !disabled && (isMobile ? setIsOpen(true) : setIsOpen((p) => !p))}
          disabled={disabled}
          className={cn(
            inputBase,
            'w-full flex items-center justify-between gap-2 cursor-pointer text-left',
            error && 'border-destructive focus:ring-destructive/40',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          <span className={cn('truncate', displayValue === '' && 'text-muted-foreground')}>
            {selectedLabel}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              'shrink-0 text-muted-foreground transition-transform',
              isOpen && !isMobile && 'rotate-180',
            )}
          />
        </button>

        {/* Desktop: custom popover listbox */}
        {!isMobile && isOpen && !disabled && (
          <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-[8px] border border-border bg-popover shadow-md">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">No options available</div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectValue(option.value)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-accent',
                    displayValue === option.value && 'bg-accent font-medium',
                  )}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        )}

        {/* Mobile: bottom sheet */}
        {isMobile && (
          <ResponsiveDropdownContainer isOpen={isOpen} onClose={() => setIsOpen(false)} title={label}>
            <div className="space-y-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectValue(option.value)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg border border-border transition-colors',
                    displayValue === option.value
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

        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        {hint && !error && <p className="text-sm text-muted-foreground mt-1">{hint}</p>}
      </div>
    );
  },
);

ResponsiveSelect.displayName = 'ResponsiveSelect';
