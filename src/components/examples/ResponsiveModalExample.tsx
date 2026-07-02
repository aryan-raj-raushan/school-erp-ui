'use client';

import { useState } from 'react';
import { ResponsiveModalContainer } from '@/components/ui/responsive-bottom-sheet';
import { Button } from '@/components/ui/button';
import { Div, P, Input, FormField } from '@/components/ui';

// Example: How to wrap an existing modal in ResponsiveModalContainer

export function ResponsiveModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    setIsOpen(false);
  };

  return (
    <Div type="col" gap="md" className="max-w-md">
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      {/* This component automatically detects screen size */}
      <ResponsiveModalContainer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add New Item"
      >
        <Div type="col" gap="md" className="px-4 py-4">
          <FormField label="Name" htmlFor="name">
            <Input
              id="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </FormField>

          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormField>

          <Div type="row" gap="sm" justify="end" className="mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </Div>
        </Div>
      </ResponsiveModalContainer>

      <P className="text-xs text-muted-foreground">
        Resize your browser or test on mobile to see the responsive behavior.
        On mobile (width &lt; 768px), this will display as a bottom sheet.
        On desktop, it appears as a centered modal.
      </P>
    </Div>
  );
}
