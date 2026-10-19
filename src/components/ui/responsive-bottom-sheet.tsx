'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { BottomSheet } from './action-sheet';
import { useBackLayer } from '@/hooks/useBackLayer';
import { useIsMobileSync } from '@/hooks/useIsMobileSync';

interface ResponsiveBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  /** Children bring their own padding (form bodies with a footer bar). */
  flush?: boolean;
}

export { useIsMobileSync as useIsMobile } from '@/hooks/useIsMobileSync';

export function ResponsiveBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  maxHeight = '90dvh',
  flush = false,
}: ResponsiveBottomSheetProps) {
  const isMobile = useIsMobileSync();
  const isDialogOpen = isOpen && !isMobile;
  useBackLayer(isDialogOpen, onClose);

  React.useEffect(() => {
    if (!isDialogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isDialogOpen, onClose]);

  // Phones share the native-style BottomSheet so every sheet locks the page
  // behind it and keeps its content inside the sheet's own scroll area.
  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title={title} maxHeight={maxHeight} flush>
        <div data-sheet-pad={flush ? undefined : ''} className={cn(!flush && 'px-4 py-4', className)}>
          {children}
        </div>
      </BottomSheet>
    );
  }

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4 safe-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          className={cn(
            'relative z-10 w-full rounded-2xl border border-border/50 max-h-[90dvh] overflow-y-auto glass-card sm:max-w-lg',
            className,
          )}
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(24px) saturate(180%)',
          }}
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {title && (
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border/40">
              <h2 className="text-sm sm:text-base font-semibold text-foreground">{title}</h2>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onClose}
                className="min-w-9 min-h-9 sm:min-w-11 sm:min-h-11"
              >
                <X size={15} />
              </Button>
            </div>
          )}
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

// For use with dropdowns - wraps select/dropdown content
export function ResponsiveDropdownContainer({
  isOpen,
  onClose,
  title,
  children,
  className,
}: Omit<ResponsiveBottomSheetProps, 'maxHeight'>) {
  return (
    <ResponsiveBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxHeight="70dvh"
      className={className}
    >
      {children}
    </ResponsiveBottomSheet>
  );
}

// For use with modals - wraps modal content
export function ResponsiveModalContainer({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ResponsiveBottomSheetProps) {
  return (
    <ResponsiveBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxHeight="90dvh"
      className={className}
    >
      {children}
    </ResponsiveBottomSheet>
  );
}
