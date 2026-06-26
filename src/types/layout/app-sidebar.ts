import { LucideIcon } from "lucide-react";
import { Role } from "..";
import { type AppPermission } from "@/constants/permissions.registry";

export interface NavSubItemConfig {
  title: string;
  url: string;
  /** User must have at least one of these permissions to see this sub-item */
  permissions?: AppPermission[];
}

export interface NavItemConfig {
  title: string;
  url: string;
  icon: LucideIcon;
  /** Filter by enum role (legacy) */
  roles?: Role[];
  /** Filter by dynamic permission — user must have at least one */
  permissions?: AppPermission[];
  items?: NavSubItemConfig[];
}
