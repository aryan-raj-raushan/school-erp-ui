import { LucideIcon } from "lucide-react";
import { Role } from "..";

interface NavSubItemConfig {
  title: string;
  url: string;
}

export interface NavItemConfig {
  title: string;
  url: string;
  icon: LucideIcon;
  roles?: Role[];
  items?: NavSubItemConfig[];
}