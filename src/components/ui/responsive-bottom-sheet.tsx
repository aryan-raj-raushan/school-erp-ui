'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';

interface ResponsiveBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showHandle?: boolean;
  maxHeight?: string;
}

// Hook to detect if screen is mobile/small (md breakpoint)
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    // Check initial width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();

    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export function ResponsiveBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  showHandle = true,
  maxHeight = '90vh',
}: ResponsiveBottomSheetProps) {
  const isMobile = useIsMobile();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Mobile: Bottom Sheet
  if (isMobile) {
    return createPortal(
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className={cn(
              'relative mt-auto w-full rounded-t-2xl border-t border-border/50 bg-background shadow-lg',
              className,
            )}
            style={{ maxHeight }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Handle indicator */}
            {showHandle && (
              <div className="flex justify-center pt-2 pb-2">
                <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
              </div>
            )}

            {/* Content */}
            <div className="flex flex-col max-h-[calc(var(--max-height,90vh)-60px)] overflow-y-auto">
              {title && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                  <h2 className="text-base font-semibold text-foreground">
                    {title}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={onClose}
                    className="min-w-9 min-h-9"
                  >
                    <X size={15} />
                  </Button>
                </div>
              )}
              <div className="px-4 py-4">{children}</div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body,
    );
  }

  // Desktop: Regular centered modal
  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Dialog */}
        <motion.div
          className={cn(
            'relative z-10 w-full rounded-2xl sm:rounded-[32px] border border-border/50 max-h-[90vh] overflow-y-auto glass-card sm:max-w-lg',
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
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 border-b border-border/40">
              <h2 className="text-base font-semibold text-foreground">{title}</h2>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onClose}
                className="min-w-11 min-h-11"
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
}: Omit<ResponsiveBottomSheetProps, 'showHandle' | 'maxHeight'>) {
  return (
    <ResponsiveBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showHandle
      maxHeight="70vh"
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
}: Omit<ResponsiveBottomSheetProps, 'showHandle'>) {
  return (
    <ResponsiveBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showHandle={false}
      maxHeight="90vh"
      className={className}
    >
      {children}
    </ResponsiveBottomSheet>
  );
}
