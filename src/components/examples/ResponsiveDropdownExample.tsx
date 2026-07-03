'use client';

import { useState } from 'react';
import { useIsMobile, ResponsiveDropdownContainer } from '@/components/ui/responsive-bottom-sheet';
import { Button } from '@/components/ui/button';
import { Div, P } from '@/components/ui';

// Example: How to wrap an existing dropdown in ResponsiveDropdownContainer

export function ResponsiveDropdownExample() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');

  const options = [
    { id: '1', label: 'Option 1' },
    { id: '2', label: 'Option 2' },
    { id: '3', label: 'Option 3' },
    { id: '4', label: 'Option 4' },
  ];

  const handleSelect = (id: string) => {
    setSelected(id);
    setIsOpen(false);
  };

  const selectedLabel = options.find((opt) => opt.id === selected)?.label || 'Select an option';

  return (
    <Div type="col" gap="md" className="max-w-md">
      <P className="text-sm text-muted-foreground">
        {isMobile ? '📱 Mobile View (Bottom Sheet)' : '🖥️ Desktop View (Dropdown)'}
      </P>

      {/* Mobile: Bottom Sheet trigger */}
      {isMobile ? (
        <>
          <ResponsiveDropdownContainer
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Select Option"
          >
            <div className="space-y-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    selected === option.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-muted/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </ResponsiveDropdownContainer>

          <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full">
            {selectedLabel}
          </Button>
        </>
      ) : (
        /* Desktop: Native select */
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {selected && (
        <P className="text-sm">
          Selected: <span className="font-semibold">{selectedLabel}</span>
        </P>
      )}
    </Div>
  );
}
