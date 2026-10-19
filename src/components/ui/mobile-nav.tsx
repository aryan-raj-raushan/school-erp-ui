"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";


const TAB_ITEM =
  "relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium transition-[color,transform] active:scale-95";

function tabTone(active: boolean) {
  return active ? "text-foreground" : "text-muted-foreground";
}

export function MobileTabLink({
  active,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { active: boolean }) {
  return <Link className={cn(TAB_ITEM, tabTone(active), className)} {...props} />;
}

export function MobileTabButton({
  active,
  className,
  ...props
}: React.ComponentProps<"button"> & { active: boolean }) {
  return <button type="button" className={cn(TAB_ITEM, tabTone(active), className)} {...props} />;
}

export function MobileTabLabel({ active, ...props }: React.ComponentProps<"span"> & { active?: boolean }) {
  return <span className={cn(active && "font-semibold")} {...props} />;
}


export function DrawerIconBox({ active, ...props }: React.ComponentProps<"span"> & { active: boolean }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
        !active && "bg-muted text-muted-foreground",
      )}
      {...props}
    />
  );
}

export function DrawerLabel({ active, ...props }: React.ComponentProps<"span"> & { active: boolean }) {
  return (
    <span
      className={cn("flex-1 truncate text-[15px]", active ? "font-semibold" : "font-medium")}
      {...props}
    />
  );
}

export function DrawerChevron({ open }: { open: boolean }) {
  return (
    <ChevronDown
      size={18}
      className={cn("shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
    />
  );
}

export function DrawerCollapse({ open, ...props }: React.ComponentProps<"div"> & { open: boolean }) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
      {...props}
    />
  );
}

export function DrawerSubLink({
  active,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { active: boolean }) {
  return (
    <Link
      className={cn(
        "flex min-h-11 items-center rounded-xl px-3 text-sm active:bg-muted",
        active ? "font-semibold" : "text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}


export function ParentTabButton({
  active,
  className,
  ...props
}: React.ComponentProps<"button"> & { active: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "flex flex-col items-center gap-1 flex-1 rounded-lg py-1.5 text-xs transition-colors",
        active ? "text-primary-text" : "text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
