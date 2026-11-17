"use client";

import { Button, CheckboxLabel, Div, FormField } from "@/components/ui";

interface SectionPickerProps {
  label: string;
  allNames: ReadonlyArray<string>;
  selected: ReadonlyArray<string>;
  onToggle: (name: string) => void;
  onSetAll: (names: string[]) => void;
  error?: string;
}

export function SectionPicker({ label, allNames, selected, onToggle, onSetAll, error }: SectionPickerProps) {
  const allSelected = allNames.length > 0 && allNames.every((name) => selected.includes(name));
  return (
    <FormField
      label={label}
      error={error}
      hint={
        selected.length
          ? `Sections ${allNames.filter((n) => selected.includes(n)).join(", ")} will be created`
          : "Optional — leave empty if this class has no sections"
      }
    >
      <Div type="row" gap="sm" wrap align="center">
        {allNames.map((name) => (
          <Div key={name} type="row" align="center" gap="xs">
            <input
              type="checkbox"
              id={`sec-${name}`}
              checked={selected.includes(name)}
              onChange={() => onToggle(name)}
            />
            <CheckboxLabel htmlFor={`sec-${name}`}>{name}</CheckboxLabel>
          </Div>
        ))}
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={() => onSetAll(allSelected ? [] : [...allNames])}
        >
          {allSelected ? "Clear all" : "Select all"}
        </Button>
      </Div>
    </FormField>
  );
}
