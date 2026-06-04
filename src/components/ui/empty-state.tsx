'use client';

import { motion } from 'framer-motion';
import { Div } from './layout';
import { H2, P } from './typography';
import { Button } from './button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Div variant="glass" type="col" align="center" center padding="py-16 px-8" gap="md">
        {icon && (
          /* theme-icon-lg: gradient circle, centers content, no raw classnames */
          <Div variant="theme-icon-lg">
            {icon}
          </Div>
        )}
        <Div type="col" align="center" center gap="xs">
          <H2>{title}</H2>
          {description && <P>{description}</P>}
        </Div>
        {action && (
          <Button size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </Div>
    </motion.div>
  );
}
