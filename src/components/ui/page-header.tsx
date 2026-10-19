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
import { useIsMobile } from "./responsive-bottom-sheet";
import { ScreenFab } from "./screen-fab";

/** One button rendered in the header's action row — pass these instead of hand-written `<Button>` JSX. */
export interface PageHeaderAction {
  label: string;
  showNoLabel?: boolean
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
  /** Small element (e.g. a status Badge) rendered next to the title. */
  badge?: React.ReactNode;
  illustration?: string;
  /** Pins the header to the top of the scrolling container — use on long forms so actions stay reachable. */
  sticky?: boolean;
  /** Shows a back button (navigates to the previous page) when true. Omit/false to hide it. */
  backButton?: boolean;
  /** Label for the back button. Defaults to "Back". */
  backLabel?: string;
}

/** Declarative header config — build one in a constants file and spread it: `<PageHeader {...config} />`. */
export type PageHeaderConfig = PageHeaderProps;

/** Header actions worth promoting to a floating button on phones. */
const FAB_LABEL = /^(add|new|create|apply|upload|generate|import|schedule)/i;

/** Header actions that must stay reachable while scrolling a long form. */
const SAVE_LABEL = /^(save|submit|update|publish|confirm)/i;

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
  badge,
  illustration,
  sticky,
  backButton,
  backLabel = "Back",
}: PageHeaderProps) {
  const router = useRouter();

  const visibleActions = isActionList(actions)
    ? actions.filter((action) => !action.hidden)
    : actions;

    const isMobile = useIsMobile();

  if (isMobile) {
    const actionList = isActionList(visibleActions) ? visibleActions : null;
    const fabAction = actionList?.find(
      (a) => a.icon && (!a.variant || a.variant === "default") && FAB_LABEL.test(a.label),
    );
    const inlineActions = actionList?.filter((a) => a !== fabAction);
    const keepVisible = sticky || Boolean(inlineActions?.some((a) => SAVE_LABEL.test(a.label)));

    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-3",
          keepVisible && "sticky top-0 z-20 bg-background/95 pb-2 backdrop-blur-sm",
        )}
      >
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-xl font-bold leading-tight">{title}</h1>
            {badge}
          </div>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {inlineActions && inlineActions.length > 0 && (
          <div className="flex shrink-0 items-center gap-2">
            {inlineActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                size={action.showNoLabel ? "icon-sm" : "sm"}
                onClick={action.onClick}
                disabled={action.disabled}
                loading={action.loading}
                aria-label={action.label}
              >
                {action.icon}
                {!action.showNoLabel && action.label}
              </Button>
            ))}
          </div>
        )}
        {!isActionList(visibleActions) && visibleActions && (
          <div className="flex w-full flex-wrap items-center gap-2">{visibleActions}</div>
        )}

        {fabAction && (
          <ScreenFab
            label={fabAction.label}
            icon={fabAction.icon}
            onClick={() => fabAction.onClick?.()}
          />
        )}
      </div>
    );
  }

  return (
    <Div
      type="col"
      gap="sm"
      className={cn(
        "pt-2",
        sticky && "sticky top-0 z-20 bg-background/95 backdrop-blur-sm",
      )}
    >
      <Div type="row" align="center" justify="between" gap="sm">
        <Div type="row"  gap="sm" className="min-w-0">
          {backButton && (
            <Button
              variant="outline"
              size={isMobile ? "icon-sm" : "icon"}
              onClick={() => router.back()}
              className="shrink-0 rounded-lg"
              aria-label={backLabel}
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
            <Div type="row" align="center" gap="sm" className="min-w-0">
              <PageTitle className="truncate">{title}</PageTitle>
              {badge}
            </Div>
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
                     size= {isMobile ? "xs" : "default"}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    loading={action.loading}
                    className="h-9 gap-1 px-4 text-[0.8rem] sm:h-11 sm:gap-1.5 sm:px-5 sm:text-sm"
                  >
                    {action.icon}
                    {!action.showNoLabel && action.label}
                  </Button>
                ))
              : visibleActions}
          </PageActions>
        )}
      </Div>
    </Div>
  );
}