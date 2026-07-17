"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Div, PageActions } from "./layout";
import { PageTitle, P } from "./typography";
import { Button, type buttonVariants } from "./button";

/** One button rendered in the header's action row — pass these instead of hand-written `<Button>` JSX. */
export interface PageHeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  disabled?: boolean;
  loading?: boolean;
  /** Skip rendering this action — lets conditional buttons stay declarative instead of inline JSX. */
  hidden?: boolean;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Raw JSX, or a declarative list of buttons for PageHeader to render. */
  actions?: React.ReactNode | PageHeaderAction[];
  illustration?: string;
  /** Pins the header to the top of the scrolling container — use on long forms so actions stay reachable. */
  sticky?: boolean;
  /** Shows a back button (navigates to the previous page) when true. Omit/false to hide it. */
  backButton?: boolean;
}

/** Declarative header config — build one in a constants file and spread it: `<PageHeader {...config} />`. */
export type PageHeaderConfig = PageHeaderProps;

function isActionList(actions: PageHeaderProps["actions"]): actions is PageHeaderAction[] {
  return Array.isArray(actions);
}

/**
 * Responsive page header.
 * Title and actions always share a single row — actions stay pinned to the
 * right edge even on mobile (the title truncates rather than pushing
 * actions to a line below). Fixed vertical padding, fixed/responsive title
 * and subtitle sizing — pages don't need to fine-tune spacing per instance.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  illustration,
  sticky,
  backButton,
}: PageHeaderProps) {
  const router = useRouter();

  const visibleActions = isActionList(actions)
    ? actions.filter((action) => !action.hidden)
    : actions;

  return (
    <Div
      type="row"
      align="center"
      justify="between"
      gap="sm"
      className={cn(
        "pt-4",
        sticky && "sticky top-0 z-20  bg-background/95 backdrop-blur-sm",
      )}
    >
      <Div type="row" align="center" gap="sm" className="min-w-0">
        {backButton && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.back()}
            className="shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </Button>
        )}
        {illustration && (
          <Image
            src={illustration}
            alt=""
            width={56}
            height={56}
            className="hidden shrink-0 select-none opacity-90 sm:block"
            draggable={false}
          />
        )}
        <Div type="col" gap="xs" className="min-w-0">
          <PageTitle className="truncate">{title}</PageTitle>
          {subtitle && <P color="muted" className="truncate">{subtitle}</P>}
        </Div>
      </Div>

      {visibleActions && (
        <PageActions className="shrink-0">
          {isActionList(visibleActions)
            ? visibleActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  loading={action.loading}
                  className="h-9 gap-1 px-4 text-[0.8rem] sm:h-11 sm:gap-1.5 sm:px-5 sm:text-sm"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))
            : visibleActions}
        </PageActions>
      )}
    </Div>
  );
}
