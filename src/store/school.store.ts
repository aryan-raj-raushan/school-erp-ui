import { create } from 'zustand';

interface SchoolBrand {
  name: string;
  logo_url: string | null;
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
