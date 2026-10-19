"use client";

import {
  BookOpen,
  CreditCard,
  FileText,
  History,
  Home,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  User,
  Users,
} from "lucide-react";
import {
  Badge,
  DetailField,
  DetailGrid,
  DetailHero,
  DetailSection,
  ListAvatar,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { openExternal } from "@/lib/external-link";
import {
  BLOOD_GROUP_OPTIONS,
  CATEGORY_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  PARENT_RELATION_OPTIONS,
  RELIGION_OPTIONS,
  STATUS_BADGE,
  STUDENT_PAGE,
} from "@/constants/students.constants";
import type { StudentFull } from "@/types/students.types";

interface Option {
  readonly value: string;
  readonly label: string;
}

function labelOf(options: ReadonlyArray<Option>, value: string | null) {
  if (!value) return undefined;
  return options.find((o) => o.value === value)?.label ?? value;
}

export interface StudentMobileProfileProps {
  data: StudentFull;
  yearName?: string;
  className?: string;
  sectionName?: string;
  onEdit: () => void;
  onGenerateIdCard: () => void;
}

export function StudentMobileProfile({
  data,
  yearName,
  className,
  sectionName,
  onEdit,
  onGenerateIdCard,
}: StudentMobileProfileProps) {
  const { student, academicInfo, previousAcademics, address, hostelInfo } = data;
  const fullName = `${student.first_name} ${student.last_name ?? ""}`.trim();
  const phone = student.phone_number
    ? `${student.dial_code ?? ""}${student.phone_number}`
    : null;
  const classLabel = [className, sectionName].filter(Boolean).join(" - ");
  const addressLine = [
    address?.address,
    address?.city,
    address?.state,
    address?.pincode,
    address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col gap-3 pt-3">
      <DetailHero
        name={fullName}
        image={student.profile_image}
        subtitle={classLabel || undefined}
        meta={`System No #${student.system_number}`}
        badge={
          <Badge variant={STATUS_BADGE[student.status]}>{student.status}</Badge>
        }
        actions={[
          {
            label: "Call",
            icon: <Phone size={18} />,
            href: `tel:${phone}`,
            hidden: !phone,
          },
          {
            label: "Message",
            icon: <MessageSquare size={18} />,
            href: `sms:${phone}`,
            hidden: !phone,
          },
          { label: "Edit", icon: <Pencil size={18} />, onClick: onEdit },
          {
            label: "ID card",
            icon: <CreditCard size={18} />,
            onClick: onGenerateIdCard,
          },
        ]}
      />

      <DetailSection title={STUDENT_PAGE.sections.basicInfo} icon={<User size={18} />}>
        <DetailGrid>
          <DetailField label="Date of birth" value={formatDate(student.date_of_birth)} />
          <DetailField label="Gender" value={labelOf(GENDER_OPTIONS, student.gender)} />
          <DetailField label="Blood group" value={labelOf(BLOOD_GROUP_OPTIONS, student.blood_group)} />
          <DetailField label="Religion" value={labelOf(RELIGION_OPTIONS, student.religion)} />
          <DetailField label="Category" value={labelOf(CATEGORY_OPTIONS, student.category)} />
          <DetailField label="Caste" value={student.caste} />
          <DetailField label="Nationality" value={student.nationality} />
          <DetailField label="Aadhaar" value={student.aadhaar_number} />
          <DetailField label="Height" value={student.height_cm ? `${student.height_cm} cm` : undefined} />
          <DetailField label="Weight" value={student.weight_kg ? `${student.weight_kg} kg` : undefined} />
          <DetailField label="Phone" value={phone} />
          <DetailField label="Email" value={student.email} wide />
        </DetailGrid>
      </DetailSection>

      <DetailSection title={STUDENT_PAGE.sections.academicInfo} icon={<BookOpen size={18} />}>
        <DetailGrid>
          <DetailField label="Academic year" value={yearName} />
          <DetailField label="Class" value={classLabel} />
          <DetailField label="Admission no." value={academicInfo?.admission_number} />
          <DetailField label="Registration no." value={academicInfo?.registration_number} />
          <DetailField label="Roll no." value={academicInfo?.roll_number} />
          <DetailField label="Joined" value={formatDate(academicInfo?.joining_date)} />
        </DetailGrid>
      </DetailSection>

      <DetailSection title={STUDENT_PAGE.sections.parents} icon={<Users size={18} />}>
        {data.parents.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            No parent details added yet
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {data.parents.map((parent) => {
              const name = `${parent.first_name} ${parent.last_name ?? ""}`.trim();
              return (
                <li key={parent.id} className="flex items-center gap-3">
                  <ListAvatar src={parent.profile_image} name={name} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {labelOf(PARENT_RELATION_OPTIONS, parent.relation)}
                      {parent.is_primary ? " · Primary" : ""}
                      {parent.can_pickup ? " · Can pick up" : ""}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {parent.dial_code}
                      {parent.phone_number}
                    </p>
                  </div>
                  <a
                    href={`tel:${parent.dial_code}${parent.phone_number}`}
                    aria-label={`Call ${name}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-text active:opacity-70"
                  >
                    <Phone size={18} />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </DetailSection>

      <DetailSection title={STUDENT_PAGE.sections.address} icon={<MapPin size={18} />} defaultOpen={false}>
        <DetailGrid>
          <DetailField label="Address" value={addressLine} wide />
        </DetailGrid>
      </DetailSection>

      <DetailSection title={STUDENT_PAGE.sections.previousAcademics} icon={<History size={18} />} defaultOpen={false}>
        <DetailGrid>
          <DetailField label="Previous school" value={previousAcademics?.previous_school_name} wide />
          <DetailField label="Class" value={previousAcademics?.previous_class} />
          <DetailField label="Passing year" value={previousAcademics?.passing_year} />
          <DetailField label="Marks" value={previousAcademics?.total_marks} />
          <DetailField label="Board" value={previousAcademics?.board} />
          <DetailField label="TC number" value={previousAcademics?.tc_number} />
        </DetailGrid>
      </DetailSection>

      <DetailSection title={STUDENT_PAGE.sections.hostelInfo} icon={<Home size={18} />} defaultOpen={false}>
        <DetailGrid>
          <DetailField label="Hostel" value={hostelInfo?.hostel_required ? "Required" : "Not required"} />
          {hostelInfo?.hostel_required && (
            <>
              <DetailField label="Hostel name" value={hostelInfo.hostel_name} />
              <DetailField label="Room" value={hostelInfo.room_number} />
            </>
          )}
        </DetailGrid>
      </DetailSection>

      <DetailSection title={STUDENT_PAGE.sections.documents} icon={<FileText size={18} />} defaultOpen={false}>
        {data.documents.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            No documents uploaded yet
          </p>
        ) : (
          <ul className="flex flex-col">
            {data.documents.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => void openExternal(doc.document_link)}
                  className="flex min-h-14 w-full items-center gap-3 rounded-xl text-left active:bg-muted"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <FileText size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">
                      {labelOf(DOCUMENT_TYPE_OPTIONS, doc.document_name)}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {doc.original_filename ?? doc.file_type}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </DetailSection>
    </div>
  );
}
