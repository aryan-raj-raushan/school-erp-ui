'use client';

import { useEffect } from 'react';
import { initTheme } from '@/store/theme.store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initTheme();
  }, []);

  return <>{children}</>;
}
