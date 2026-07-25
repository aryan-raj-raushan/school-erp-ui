import { create } from 'zustand';
import { AppStorage } from '@/lib/app-storage';
import type { ChildSummary } from '@/services/parent-portal.service';

const CHILDREN_KEY = 'parent:children';
const ACTIVE_STUDENT_KEY = 'parent:active_student_id';

function readStoredChildren(): ChildSummary[] {
  try {
    const raw = AppStorage.get(CHILDREN_KEY);
    return raw ? (JSON.parse(raw) as ChildSummary[]) : [];
  } catch {
    return [];
  }
}

interface ParentState {
  children: ChildSummary[];
  activeStudentId: string | null;
  setChildren: (children: ChildSummary[]) => void;
  setActiveStudentId: (studentId: string | null) => void;
  clear: () => void;
}

export const useParentStore = create<ParentState>((set) => ({
  children: readStoredChildren(),
  activeStudentId: AppStorage.get(ACTIVE_STUDENT_KEY),

  setChildren: (children) => {
    AppStorage.set(CHILDREN_KEY, JSON.stringify(children));
    set({ children });
  },

  setActiveStudentId: (studentId) => {
    if (studentId) AppStorage.set(ACTIVE_STUDENT_KEY, studentId);
    else AppStorage.delete(ACTIVE_STUDENT_KEY);
    set({ activeStudentId: studentId });
  },

  clear: () => {
    AppStorage.delete(CHILDREN_KEY);
    AppStorage.delete(ACTIVE_STUDENT_KEY);
    set({ children: [], activeStudentId: null });
  },
}));
