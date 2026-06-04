import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';
export type TemplateId = 'amber' | 'ocean' | 'forest' | 'violet' | 'custom';

export interface ThemeOption {
  id: Exclude<TemplateId, 'custom'>;
  label: string;
  color: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'amber',  label: 'Amber',  color: '#F6C445' },
  { id: 'ocean',  label: 'Ocean',  color: '#0EA5E9' },
  { id: 'forest', label: 'Forest', color: '#22C55E' },
  { id: 'violet', label: 'Violet', color: '#8B5CF6' },
];

export const THEME_PALETTE: string[] = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#14B8A6', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
  '#EC4899', '#F43F5E', '#64748B', '#0F172A',
];

export const THEME_FALLBACK_COLOR = '#6366F1';

/* ─── Color helpers (exported so ThemeSelector can use them) ─────────── */

export function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function lightenHex(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  const light = (n: number) => Math.min(255, Math.round(n + (255 - n) * amount));
  const r = light(parseInt(c.slice(0, 2), 16));
  const g = light(parseInt(c.slice(2, 4), 16));
  const b = light(parseInt(c.slice(4, 6), 16));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  /* WCAG relative luminance */
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 0.35;
}

const CUSTOM_CSS_VARS = [
  '--theme-gradient-from', '--theme-gradient-to',
  '--theme-glow', '--theme-glow-soft', '--theme-active-text',
  '--primary', '--primary-foreground',
  '--ring', '--sidebar-primary', '--sidebar-accent', '--sidebar-ring', '--chart-1',
];

function applyCustomCSS(hex: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const lighter = lightenHex(hex, 0.22);
  const light = isLightColor(hex);
  const activeText = light ? '#111827' : '#ffffff';
  root.style.setProperty('--theme-gradient-from', hex);
  root.style.setProperty('--theme-gradient-to', lighter);
  root.style.setProperty('--theme-glow', hexToRgba(hex, 0.4));
  root.style.setProperty('--theme-glow-soft', hexToRgba(hex, 0.13));
  root.style.setProperty('--theme-active-text', activeText);
  root.style.setProperty('--primary', hex);
  root.style.setProperty('--primary-foreground', activeText);
  root.style.setProperty('--ring', hexToRgba(hex, 0.5));
  root.style.setProperty('--sidebar-primary', hex);
  root.style.setProperty('--sidebar-accent', hexToRgba(hex, 0.12));
  root.style.setProperty('--sidebar-ring', hexToRgba(hex, 0.5));
  root.style.setProperty('--chart-1', hex);
}

function clearCustomCSS() {
  if (typeof document === 'undefined') return;
  CUSTOM_CSS_VARS.forEach((v) => document.documentElement.style.removeProperty(v));
}

/* ─── Theme application ──────────────────────────────────────────────── */

function applyTheme(mode: ThemeMode, templateId: TemplateId, customColor?: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');

  if (templateId === 'custom' && customColor) {
    /* Use amber as base layout, override accent vars via inline styles */
    root.setAttribute('data-template', 'amber');
    applyCustomCSS(customColor);
  } else {
    root.setAttribute('data-template', templateId);
    clearCustomCSS();
  }

  localStorage.setItem('theme-mode', mode);
  localStorage.setItem('theme-template', templateId);
  if (customColor) localStorage.setItem('theme-custom-color', customColor);
}

/* ─── Persistence helpers ─────────────────────────────────────────────── */

function readStoredMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'light';
  return (localStorage.getItem('theme-mode') as ThemeMode) ?? 'light';
}

function readStoredTemplate(): TemplateId {
  if (typeof localStorage === 'undefined') return 'amber';
  const v = localStorage.getItem('theme-template') as TemplateId;
  const valid: TemplateId[] = ['amber', 'ocean', 'forest', 'violet', 'custom'];
  return valid.includes(v) ? v : 'amber';
}

function readStoredCustomColor(): string | undefined {
  if (typeof localStorage === 'undefined') return undefined;
  return localStorage.getItem('theme-custom-color') ?? undefined;
}

/* ─── Zustand store ───────────────────────────────────────────────────── */

interface ThemeState {
  mode: ThemeMode;
  templateId: TemplateId;
  customColor: string | undefined;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setTemplate: (id: TemplateId) => void;
  setCustomColor: (hex: string) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  templateId: 'amber',
  customColor: undefined,

  setMode: (mode) => {
    set((s) => { applyTheme(mode, s.templateId, s.customColor); return { mode }; });
  },

  toggleMode: () => {
    set((s) => {
      const next: ThemeMode = s.mode === 'light' ? 'dark' : 'light';
      applyTheme(next, s.templateId, s.customColor);
      return { mode: next };
    });
  },

  setTemplate: (templateId) => {
    set((s) => {
      applyTheme(s.mode, templateId, s.customColor);
      return { templateId };
    });
  },

  setCustomColor: (hex) => {
    set((s) => {
      applyTheme(s.mode, 'custom', hex);
      return { templateId: 'custom', customColor: hex };
    });
  },
}));

export function initTheme() {
  const mode = readStoredMode();
  const templateId = readStoredTemplate();
  const customColor = readStoredCustomColor();
  applyTheme(mode, templateId, customColor);
  useThemeStore.setState({ mode, templateId, customColor });
}
