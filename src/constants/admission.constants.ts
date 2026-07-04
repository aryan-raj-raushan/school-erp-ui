import { EnquiryAction, EnquiryStatus } from "@/types/admissions.types";

export const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "NEW", label: "New" },
  { value: "FOLLOW_UP", label: "Follow Up" },
  { value: "ADMISSION_CONFIRMED", label: "Admission Confirmed" },
  { value: "ONBOARDING_IN_PROGRESS", label: "Student Onboarding - Progress" },
  { value: "REJECTED", label: "Rejected" },
];

export const STATUS_BADGE: Record<
  EnquiryStatus,
  "default" | "info" | "warning" | "success" | "danger"
> = {
  NEW: "info",
  FOLLOW_UP: "warning",
  ADMISSION_CONFIRMED: "success",
  ONBOARDING_IN_PROGRESS: "warning",
  REJECTED: "danger",
};

export const ACTION_OPTIONS: { value: EnquiryAction; label: string }[] = [
  { value: "NEXT_FOLLOW_UP_UPDATE", label: "Next Follow Up Update" },
  { value: "ADMISSION_CONFIRMED", label: "Admission Confirmed" },
  { value: "ENQUIRY_REJECTED", label: "Enquiry Rejected" },
];

export const ADMISSION_PAGE = {
  pageHeading: {
    title: "Admission Enquiries",
    subtitle: "",
  },
  buttons: {
    manage: "Manage Sources",
    addEnquiry: "New Enquiry",
  },
  table: {
    sno: "S. No.",
    studentName: "Student Name",
    fatherName: "Father Name",
    motherName: "Mother Name",
    phone: "Phone",
    applyingAcadYear: "Applying Academic Year",
    applyingClass: "Applying Class",
    createdDate: "Created Date",
    followUpDate: "Follow-up Date",
    teacherAssigned: "Teacher Assigned",
    actions: "Actions",
    noEntry: "No entry found",
  },
};

export const ADMISSION_DETAIL_PAGE = {};

export const ADMISSION_FOLLOWUP_PAGE = {};

export const ADMISSION_SOURCE_PAGE = {};
