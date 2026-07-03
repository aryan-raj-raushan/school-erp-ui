import { useState, useCallback } from 'react';
import { useIsMobile } from '@/components/ui/responsive-bottom-sheet';

interface UseResponsiveDropdownOptions {
  title?: string;
}

export function useResponsiveDropdown(options?: UseResponsiveDropdownOptions) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const openDropdown = useCallback(() => {
    if (isMobile) {
      setIsOpen(true);
    }
  }, [isMobile]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isMobile,
    isOpen,
    openDropdown,
    closeDropdown,
    title: options?.title,
  };
}
