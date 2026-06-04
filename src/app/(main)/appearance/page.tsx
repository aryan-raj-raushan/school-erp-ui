"use client";

import { HexColorPicker, HexColorInput } from "react-colorful";
import { Check, Moon, Sun } from "lucide-react";
import {
  useThemeStore,
  THEME_OPTIONS,
  isLightColor,
  type TemplateId,
} from "@/store/theme.store";
import { Div } from "@/components/ui/layout";
import { PageTitle, H2, H3, P, SectionLabel } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PALETTE: string[] = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308",
  "#84CC16", "#22C55E", "#14B8A6", "#06B6D4",
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7",
  "#EC4899", "#F43F5E", "#64748B", "#0F172A",
];

export default function AppearancePage() {
  const {
    templateId,
    customColor,
    mode,
    setTemplate,
    setCustomColor,
    setMode,
  } = useThemeStore();

  const isCustom = templateId === "custom";
  const pickerColor =
    isCustom && customColor ? customColor : "#6366F1";

  return (
    <Div type="col" gap="lg">

      {/* Page header */}
      <Div type="col" gap="xs">
        <PageTitle color="theme">Appearance</PageTitle>
        <P>Customize themes, colors, and display preferences.</P>
      </Div>

      <Div type="grid" cols={2} gap="lg">

        {/* ── Left column ── */}
        <Div type="col" gap="lg">

          {/* Mode toggle */}
          <Div variant="glass" padding="p-5" type="col" gap="md">
            <Div type="col" gap="xs">
              <H2>Display Mode</H2>
              <P>Choose light or dark appearance.</P>
            </Div>
            <Div type="row" gap="sm">
              <Button
                variant={mode === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("light")}
              >
                <Sun size={15} />
                Light
              </Button>
              <Button
                variant={mode === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("dark")}
              >
                <Moon size={15} />
                Dark
              </Button>
            </Div>
          </Div>

          {/* Preset themes */}
          <Div variant="glass" padding="p-5" type="col" gap="md">
            <Div type="col" gap="xs">
              <H2>Preset Themes</H2>
              <P>Pick a curated color palette.</P>
            </Div>
            <Div type="grid" cols={2} gap="sm">
              {THEME_OPTIONS.map((t) => {
                const active = templateId === t.id;
                return (
                  <Button
                    key={t.id}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTemplate(t.id as TemplateId)}
                    style={
                      active
                        ? {
                            background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)`,
                            color: isLightColor(t.color) ? "#111827" : "#fff",
                            boxShadow: `0 4px 12px ${t.color}55`,
                          }
                        : { borderColor: t.color, color: t.color }
                    }
                  >
                    {active && <Check size={13} />}
                    {t.label}
                  </Button>
                );
              })}
            </Div>
          </Div>

          {/* Quick palette */}
          <Div variant="glass" padding="p-5" type="col" gap="md">
            <Div type="col" gap="xs">
              <H2>Quick Colors</H2>
              <P>One-click custom accent.</P>
            </Div>
            <Div type="grid" cols={4} gap="xs">
              {PALETTE.map((color) => {
                const active = isCustom && customColor === color;
                return (
                  <Button
                    key={color}
                    variant="ghost"
                    size="icon-sm"
                    title={color}
                    onClick={() => setCustomColor(color)}
                    style={{
                      backgroundColor: color,
                      boxShadow: active
                        ? `0 0 0 2px white, 0 0 0 4px ${color}`
                        : undefined,
                      transform: active ? "scale(1.12)" : undefined,
                    }}
                  >
                    {active && (
                      <Check
                        size={11}
                        color={isLightColor(color) ? "#111827" : "#fff"}
                      />
                    )}
                  </Button>
                );
              })}
            </Div>
          </Div>
        </Div>

        {/* ── Right column — color picker ── */}
        <Div type="col" gap="lg">
          <Div variant="glass" padding="p-5" type="col" gap="md">
            <Div type="col" gap="xs">
              <H2>Custom Color</H2>
              <P>Pick any exact color as your accent.</P>
            </Div>

            {/* react-colorful picker */}
            <Div type="col" align="center" gap="md">
              <HexColorPicker
                color={pickerColor}
                onChange={(hex) => setCustomColor(hex)}
                style={{ width: "100%", height: 220, borderRadius: 16 }}
              />
              <Div type="row" gap="sm" align="center">
                <SectionLabel>#</SectionLabel>
                <HexColorInput
                  color={pickerColor}
                  onChange={(hex) => setCustomColor(hex)}
                  prefixed={false}
                  style={{
                    width: 120,
                    padding: "8px 12px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                    fontSize: 14,
                    fontFamily: "monospace",
                    outline: "none",
                  }}
                />
                <Div
                  variant="theme-icon-sm"
                  style={{ backgroundColor: pickerColor }}
                />
              </Div>
            </Div>
          </Div>

          {/* Live preview */}
          <Div variant="glass" padding="p-5" type="col" gap="md">
            <Div type="col" gap="xs">
              <H2>Preview</H2>
              <P>How your theme looks on components.</P>
            </Div>

            <Div type="col" gap="sm">
              {/* Buttons */}
              <Div type="row" gap="sm" align="center">
                <Button size="sm">Primary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
              </Div>

              {/* Badges */}
              <Div type="row" gap="sm" align="center">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="danger">Danger</Badge>
              </Div>

              {/* Icon circle */}
              <Div type="row" gap="sm" align="center">
                <Div variant="theme-icon">
                  <Check size={16} />
                </Div>
                <Div variant="theme-icon-lg">
                  <Check size={20} />
                </Div>
                <H3 color="default">Icon circles</H3>
              </Div>

              {/* Gradient text */}
              <H2 color="theme">Gradient heading</H2>
            </Div>
          </Div>
        </Div>
      </Div>
    </Div>
  );
}
