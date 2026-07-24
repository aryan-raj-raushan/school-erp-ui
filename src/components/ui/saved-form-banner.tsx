'use client';

import { History } from 'lucide-react';
import { Div } from './layout';
import { P } from './typography';
import { Button } from './button';

interface SavedFormBannerProps {
  title?: string;
  description?: string;
  continueLabel?: string;
  discardLabel?: string;
  onContinue: () => void;
  onDiscard: () => void;
}

export function SavedFormBanner({
  title = 'You have an unfinished draft of this form',
  description = 'Continue filling it from where you left off?',
  continueLabel = 'Continue Draft',
  discardLabel = 'Start Fresh',
  onContinue,
  onDiscard,
}: SavedFormBannerProps) {
  return (
    <Div
      type="col"
      gap="sm"
      className="sm:flex-row sm:items-center sm:justify-between rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4"
    >
      <Div type="row" align="start" gap="sm">
        <Div className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5">
          <History size={16} />
        </Div>
        <Div type="col" gap="xs">
          <P size="sm" className="font-medium">
            {title}
          </P>
          <P size="sm" color="muted">
            {description}
          </P>
        </Div>
      </Div>
      <Div type="row" gap="sm" className="w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none"
          onClick={onDiscard}
        >
          {discardLabel}
        </Button>
        <Button size="sm" className="flex-1 sm:flex-none" onClick={onContinue}>
          {continueLabel}
        </Button>
      </Div>
    </Div>
  );
}
