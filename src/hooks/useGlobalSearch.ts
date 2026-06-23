'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  SearchService,
  GlobalSearchResult,
  SearchResultItem,
  SearchResultType,
  EMPTY_SEARCH_RESULT,
} from '@/services/search.service';

export type { SearchResultItem, SearchResultType, GlobalSearchResult };

export const RECORD_URL: Record<SearchResultType, (id: string) => string> = {
  student:       (id) => `/students/${id}`,
  staff:         (id) => `/staffs/${id}`,
  parent:        ()   => `/parents`,
  admission:     (id) => `/admissions/${id}`,
  class:         (id) => `/school/classes/${id}`,
  subject:       (id) => `/school/subjects/${id}`,
  department:    (id) => `/school/departments/${id}`,
  fee_type:      ()   => `/fees/setup`,
  event:         (id) => `/school/holidays-events/${id}`,
  academic_year: (id) => `/school/academic-years/${id}`,
  homework:      (id) => `/school/homework/${id}`,
};

export const TYPE_BADGE: Record<SearchResultType, { bg: string; color: string; label: string }> = {
  student:       { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8', label: 'Student'    },
  staff:         { bg: 'rgba(16,185,129,0.15)',  color: '#34d399', label: 'Staff'      },
  parent:        { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', label: 'Parent'     },
  admission:     { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', label: 'Admission'  },
  class:         { bg: 'rgba(139,92,246,0.15)',  color: '#a78bfa', label: 'Class'      },
  subject:       { bg: 'rgba(6,182,212,0.15)',   color: '#22d3ee', label: 'Subject'    },
  department:    { bg: 'rgba(20,184,166,0.15)',  color: '#2dd4bf', label: 'Department' },
  fee_type:      { bg: 'rgba(234,179,8,0.15)',   color: '#facc15', label: 'Fee Type'   },
  event:         { bg: 'rgba(236,72,153,0.15)',  color: '#f472b6', label: 'Event'      },
  academic_year: { bg: 'rgba(14,165,233,0.15)',  color: '#38bdf8', label: 'Acad. Year' },
  homework:      { bg: 'rgba(132,204,22,0.15)',  color: '#a3e635', label: 'Homework'   },
};

export const SECTIONS: { key: keyof Omit<GlobalSearchResult, 'query'>; label: string }[] = [
  { key: 'students',      label: 'Students'          },
  { key: 'staff',         label: 'Staff'             },
  { key: 'parents',       label: 'Parents'           },
  { key: 'admissions',    label: 'Admissions'        },
  { key: 'classes',       label: 'Classes'           },
  { key: 'subjects',      label: 'Subjects'          },
  { key: 'departments',   label: 'Departments'       },
  { key: 'feeTypes',      label: 'Fee Types'         },
  { key: 'events',        label: 'Holidays & Events' },
  { key: 'academicYears', label: 'Academic Years'    },
  { key: 'homework',      label: 'Homework'          },
];

export function useGlobalSearch(open: boolean, onClose: () => void) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [results, setResults] = useState<GlobalSearchResult>(EMPTY_SEARCH_RESULT);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flatItems = useMemo<SearchResultItem[]>(() => {
    if (query.trim().length < 2) return [];
    const items: SearchResultItem[] = [];
    SECTIONS.forEach(({ key }) => {
      (results[key] as SearchResultItem[]).forEach((item) => items.push(item));
    });
    return items;
  }, [results, query]);

  const clear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setResults(EMPTY_SEARCH_RESULT);
    setIsLoading(false);
  }, []);

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.trim().length < 2) { setResults(EMPTY_SEARCH_RESULT); setIsLoading(false); return; }
    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await SearchService.global(q.trim());
        setResults(data);
      } catch {
        setResults(EMPTY_SEARCH_RESULT);
      } finally {
        setIsLoading(false);
      }
    }, 400);
  }, []);

  const navigate = useCallback((item: SearchResultItem) => {
    router.push(RECORD_URL[item.type](item.id));
    onClose();
  }, [router, onClose]);

  const scrollToSelected = useCallback((idx: number) => {
    listRef.current?.querySelectorAll('button')?.[idx]?.scrollIntoView({ block: 'nearest' });
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSelected(0);
    clear();
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open, clear]);

  useEffect(() => { setSelected(0); }, [query]);
  useEffect(() => { search(query); }, [query, search]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => { const next = Math.min(s + 1, flatItems.length - 1); scrollToSelected(next); return next; });
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => { const next = Math.max(s - 1, 0); scrollToSelected(next); return next; });
      }
      if (e.key === 'Enter' && flatItems[selected]) navigate(flatItems[selected]);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, selected, flatItems, navigate, onClose, scrollToSelected]);

  return {
    query,
    setQuery,
    selected,
    setSelected,
    inputRef,
    listRef,
    results,
    isLoading,
    flatItems,
    navigate,
  };
}
