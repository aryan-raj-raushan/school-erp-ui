import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type IconType =
  | "default"
  | "chevron-icon"
  | "menu-icon"
  | "sidebar-icon"
  | "action-icon"
  | "sm"
  | "sm-danger"
  | "sm-inline"
  | "btn-icon"
  | "muted";

const typeMap: Record<IconType, string> = {
  default: "",
  "chevron-icon": "ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90",
  "menu-icon": "size-5 text-muted-foreground",
  "sidebar-icon": "size-4 shrink-0",
  "action-icon": "size-4 cursor-pointer hover:opacity-80 transition-opacity",
  /** size-3, neutral */
  "sm": "size-3",
  /** size-3, destructive red */
  "sm-danger": "size-3 text-destructive",
  /** size-3 with right margin — for icon+text button labels */
  "sm-inline": "size-3 mr-1",
  /** size-4 with right margin — for icon+text button labels */
  "btn-icon": "size-4 mr-1",
  /** size-4, muted foreground */
  "muted": "size-4 text-muted-foreground",
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: LucideIcon;
  type?: IconType;
  size?: number;
}

export function Icon({
  icon: IconComponent,
  type = "default",
  size = 18,
  className,
  ...props
}: IconProps) {
  return (
    <IconComponent
      size={size}
      className={cn(typeMap[type], className)}
      {...props}
    />
  );
}
