'use client';

import { useRef, useState } from 'react';
import { Check, Moon, Paintbrush, Sun, X } from 'lucide-react';
import {
  useThemeStore,
  THEME_OPTIONS,
  isLightColor,
  type TemplateId,
} from '@/store/theme.store';
import { Div } from './layout';
import { SectionLabel, P } from './typography';
import { Button } from './button';

const PALETTE: string[] = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#14B8A6', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
  '#EC4899', '#F43F5E', '#64748B', '#0F172A',
];

export function ThemeSelector() {
  const { templateId, customColor, mode, setTemplate, setCustomColor, toggleMode } =
    useThemeStore();

  const [paletteOpen, setPaletteOpen] = useState(templateId === 'custom');
  const colorInputRef = useRef<HTMLInputElement>(null);

  const isCustom = templateId === 'custom';
  const activePreset = THEME_OPTIONS.find((t) => t.id === templateId);
  const displayLabel = isCustom ? 'Custom' : (activePreset?.label ?? '');

  return (
    <Div variant="glass-flat" type="col" gap="sm" padding="p-3">

      {/* Title + mode toggle */}
      <Div type="row" justify="between" align="center">
        <SectionLabel>Theme</SectionLabel>
        <Button variant="ghost" size="icon-xs" onClick={toggleMode}>
          {mode === 'light' ? <Moon size={13} /> : <Sun size={13} />}
        </Button>
      </Div>

      {/* Preset dots + custom toggle + label */}
      <Div type="row" gap="xs" align="center">
        {THEME_OPTIONS.map((t) => {
          const active = templateId === t.id;
          /* Dynamic color via style is acceptable — color comes from data */
          return (
            <Button
              key={t.id}
              variant="ghost"
              size="icon-xs"
              title={t.label}
              onClick={() => { setTemplate(t.id as TemplateId); setPaletteOpen(false); }}
              style={{
                backgroundColor: t.color,
                boxShadow: active ? `0 0 0 2px white, 0 0 0 4px ${t.color}` : undefined,
                transform: active ? 'scale(1.15)' : undefined,
              }}
            >
              {active && <Check size={10} color={isLightColor(t.color) ? '#111827' : '#fff'} />}
            </Button>
          );
        })}

        {/* Custom color button */}
        <Button
          variant="ghost"
          size="icon-xs"
          title="Custom"
          onClick={() => setPaletteOpen((v) => !v)}
          style={{
            backgroundColor: isCustom && customColor ? customColor : undefined,
            boxShadow: isCustom && customColor
              ? `0 0 0 2px white, 0 0 0 4px ${customColor}`
              : undefined,
            transform: isCustom ? 'scale(1.15)' : undefined,
            border: '2px dashed var(--border)',
          }}
        >
          {isCustom && customColor
            ? <Check size={10} color={isLightColor(customColor) ? '#111827' : '#fff'} />
            : <Paintbrush size={10} />
          }
        </Button>

        <P size="xs" weight="semibold">{displayLabel}</P>
      </Div>

      {/* Expanded palette */}
      {paletteOpen && (
        <Div type="col" gap="sm">
          <Div type="grid" cols={4} gap="xs">
            {PALETTE.map((color) => {
              const active = isCustom && customColor === color;
              return (
                <Button
                  key={color}
                  variant="ghost"
                  size="icon-xs"
                  title={color}
                  onClick={() => setCustomColor(color)}
                  style={{
                    backgroundColor: color,
                    boxShadow: active ? `0 0 0 2px white, 0 0 0 3px ${color}` : undefined,
                    transform: active ? 'scale(1.1)' : undefined,
                  }}
                >
                  {active && <Check size={9} color={isLightColor(color) ? '#111827' : '#fff'} />}
                </Button>
              );
            })}
          </Div>

          {/* Pick any color row */}
          <Div type="row" gap="sm" align="center">
            <Button
              variant="outline"
              size="xs"
              onClick={() => colorInputRef.current?.click()}
            >
              <Paintbrush size={12} />
              Pick any color
            </Button>

            {isCustom && (
              <Button
                variant="ghost"
                size="icon-xs"
                title="Reset"
                onClick={() => { setTemplate('amber'); setPaletteOpen(false); }}
              >
                <X size={12} />
              </Button>
            )}

            <input
              ref={colorInputRef}
              type="color"
              value={isCustom && customColor ? customColor : '#6366F1'}
              onChange={(e) => setCustomColor(e.target.value)}
              style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
            />
          </Div>
        </Div>
      )}
    </Div>
  );
}
