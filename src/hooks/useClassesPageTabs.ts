'use client';

import { useState } from 'react';

export type ClassesTab = 'classes' | 'class-details';

export const CLASSES_TAB_OPTIONS = [
  { value: 'classes' as ClassesTab, label: 'Classes' },
  { value: 'class-details' as ClassesTab, label: 'Class Details' },
] as const;

export function useClassesPageTabs() {
  const [activeTab, setActiveTab] = useState<ClassesTab>('classes');

  return {
    activeTab,
    setActiveTab,
  };
}
