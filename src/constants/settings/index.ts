import {
  CalendarDays,
  BookOpen,
  DoorOpen,
  Settings2,
  Building2,
  SlidersHorizontal,
  Clock,
  LayoutGrid,
  Bell,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

export interface SettingItem {
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const SETTINGS_ITEMS: SettingItem[] = [
  {
    slug: "school-profile",
    label: "School Profile",
    description: "Name, UDISE code, affiliation, timezone, principal details, and logo.",
    icon: Building2,
  },
  {
    slug: "school-config",
    label: "School Config",
    description: "Attendance method, lock hours, conflict resolution mode, and late rules.",
    icon: SlidersHorizontal,
  },
  {
    slug: "timings",
    label: "Timing Schedules",
    description: "Summer, winter, exam, and special timing schedules with late/half-day cutoffs.",
    icon: Clock,
  },
  {
    slug: "class-timings",
    label: "Class Timings",
    description: "Override the default school timing for specific classes.",
    icon: LayoutGrid,
  },
  {
    slug: "academic-year",
    label: "Academic Year",
    description: "Manage academic years, start & end dates, freeze attendance, and rollover.",
    icon: CalendarDays,
  },
  {
    slug: "class-section",
    label: "Class & Section",
    description: "Configure classes, sections, and their assignments.",
    icon: BookOpen,
  },
  {
    slug: "room-name",
    label: "Room Name",
    description: "Add and organise rooms used for scheduling and allocation.",
    icon: DoorOpen,
  },
  {
    slug: "academic-configuration",
    label: "Academic Configuration",
    description: "Set grading policies, promotion rules, and global defaults.",
    icon: Settings2,
  },
  {
    slug: "notification-rules",
    label: "Notification Rules",
    description: "Configure which events trigger parent, student, and teacher notifications.",
    icon: Bell,
  },
  {
    slug: "audit-log",
    label: "Audit Log",
    description: "Filterable history of all changes — who changed what, when, and from where.",
    icon: ScrollText,
  },
];
