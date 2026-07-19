import { create } from 'zustand';
import type { RestrictionMode } from '@/types';

interface SchoolBrand {
  name: string;
  logo_url: string | null;
  restriction_level?: RestrictionMode;
  restriction_reason?: string | null;
}

interface SchoolBrandState {
  brand: SchoolBrand | null;
  setBrand: (brand: SchoolBrand) => void;
  clearBrand: () => void;
}

export const useSchoolBrandStore = create<SchoolBrandState>((set) => ({
  brand: null,
  setBrand: (brand) => set({ brand }),
  clearBrand: () => set({ brand: null }),
}));
