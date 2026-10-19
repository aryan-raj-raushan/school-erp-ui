import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import type { EnquiryAction } from "@/types/admissions.types";

export const ACTION_ICON: Record<EnquiryAction, React.ReactNode> = {
  NEW_ENQUIRY: <FileText size={16} className="text-slate-500" />,
  NEXT_FOLLOW_UP_UPDATE: <Clock size={16} className="text-blue-500" />,
  ADMISSION_CONFIRMED: <CheckCircle2 size={16} className="text-emerald-500" />,
  ENQUIRY_REJECTED: <XCircle size={16} className="text-red-500" />,
};
