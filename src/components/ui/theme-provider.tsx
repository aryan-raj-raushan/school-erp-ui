'use client';

import { useEffect } from 'react';
import { initTheme } from '@/store/theme.store';
import { NativeSystemBars } from '@/components/layout/NativeSystemBars';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <>
      <NativeSystemBars />
      {children}
    </>
  );
}
