import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type IconType =
  | "default"
  | "chevron-icon"
  | "menu-icon"
  | "sidebar-icon"
  | "action-icon";

const typeMap: Record<IconType, string> = {
  default: "",

  "chevron-icon":
    "ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90",

  "menu-icon": "size-5 text-muted-foreground",

  "sidebar-icon": "size-4 shrink-0",

  "action-icon": "size-4 cursor-pointer hover:opacity-80 transition-opacity",
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
