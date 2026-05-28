import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';
export type TemplateId = 'default'; // extend: 'blue' | 'indigo' | etc.

interface ThemeState {
  mode: ThemeMode;
  templateId: TemplateId;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setTemplate: (id: TemplateId) => void;
}

function applyTheme(mode: ThemeMode, templateId: TemplateId) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  root.setAttribute('data-template', templateId);
  localStorage.setItem('theme-mode', mode);
  localStorage.setItem('theme-template', templateId);
}

function readStoredMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'light';
  return (localStorage.getItem('theme-mode') as ThemeMode) ?? 'light';
}

function readStoredTemplate(): TemplateId {
  if (typeof localStorage === 'undefined') return 'default';
  return (localStorage.getItem('theme-template') as TemplateId) ?? 'default';
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light',
  templateId: 'default',

  setMode: (mode) => {
    set((s) => { applyTheme(mode, s.templateId); return { mode }; });
  },

  toggleMode: () => {
    set((s) => {
      const next: ThemeMode = s.mode === 'light' ? 'dark' : 'light';
      applyTheme(next, s.templateId);
      return { mode: next };
    });
  },

  setTemplate: (templateId) => {
    set((s) => { applyTheme(s.mode, templateId); return { templateId }; });
  },
}));

export function initTheme() {
  const mode = readStoredMode();
  const templateId = readStoredTemplate();
  applyTheme(mode, templateId);
  useThemeStore.setState({ mode, templateId });
}
