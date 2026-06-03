import {
  Users,
  FileText,
  Settings,
  CircleHelp,
  ClipboardCheck,
  Wallet,
  CalendarDays,
  Building2,
  CircleDollarSign,
  GraduationCap,
  BookOpen,
  CalendarCheck,
} from "lucide-react";
import { Role } from "@/types";
import { NavItemConfig } from "@/types/layout/app-sidebar";

export const APP_NAV_USER = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

const SCHOOL_ROLES = [Role.SCHOOL_ADMIN];
const SUPER_ROLES = [Role.SUPER_ADMIN, Role.ADMIN];

export const APP_NAV_MAIN: NavItemConfig[] = [
  /* ---------------------------------------------------
  Super Admin
  --------------------------------------------------- */

  /* ---------------------------------------------------
  School Admin
  --------------------------------------------------- */
  {
    title: "Teams",
    url: "#",
    icon: Users,
    roles: SCHOOL_ROLES,
    items: [
      { title: "Students", url: "/students" },
      { title: "Staff", url: "/staffs" },
      { title: "Parents", url: "/parents" },
    ],
  },
  
  
  {
    title: "Attendance",
    url: "#",
    icon: ClipboardCheck,
    roles: SCHOOL_ROLES,
    items: [
      { title: "Students Attendance", url: "/attendance/students" },
      { title: "Staff Attendance", url: "/attendance/staffs" },
    ],
  },
  {
    title: "Attendance Report",
    url: "#",
    icon: CalendarCheck,
    roles: SCHOOL_ROLES,
    items: [
      { title: "Students Attendance Reports", url: "/attendance/report/students" },
      { title: "Staffs Attendance Reports", url: "/attendance/report/staffs" },
    ],
  },
  {
    title: "Academics",
    url: "#",
    icon: FileText,
    roles: SCHOOL_ROLES,
    items: [
      { title: "Homework", url: "/school/homework" },
      { title: "Study Materials", url: "/school/materials" },
    ],
  },
  {
    title: "Finance",
    url: "#",
    icon: Wallet,
    roles: SCHOOL_ROLES,
    items: [
      { title: "Fee Types", url: "/finance/types" },
      { title: "Generate Fee", url: "/finance/generate" },
      { title: "Receipts", url: "/finance/receipts" },
    ],
  },
  {
    title: "Examinations",
    url: "#",
    icon: BookOpen,
    roles: SCHOOL_ROLES,
    items: [
      { title: "Exam Setup", url: "/exams/master-data" },
      { title: "Exam Schedule", url: "/exams/timetable" },
      { title: "Hall Tickets", url: "/exams/admit-cards" },
    ],
  },
  {
    title: "Leave",
    url: "#",
    icon: CalendarDays,
    roles: SCHOOL_ROLES,
    items: [
      { title: "Leave Policy", url: "/leave/policy" },
      { title: "Leave Management", url: "/leave" },
    ],
  },

  {
    title: "School Setup",
    url: "#",
    icon: GraduationCap,
    roles: SCHOOL_ROLES,
    items: [
      { title: "Academic Years", url: "/school/academic-years" },
      { title: "Classes & Sections", url: "/school/classes" },
    ],
  },

  /* ---------------------------------------------------
  SUPER ROLES
  --------------------------------------------------- */
  {
    title: "Schools",
    url: "/schools",
    icon: Building2,
    roles: SUPER_ROLES,
  },
  {
    title: "Subscriptions",
    url: "/subscriptions",
    icon: CircleDollarSign,
    roles: SUPER_ROLES,
  },
];

export const APP_NAV_SECONDARY: NavItemConfig[] = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Get Help",
    url: "/help",
    icon: CircleHelp,
  },
];
