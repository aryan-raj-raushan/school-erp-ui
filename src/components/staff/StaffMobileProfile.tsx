"use client";

import {
  Briefcase,
  History,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  User,
} from "lucide-react";
import {
  Badge,
  DetailField,
  DetailGrid,
  DetailHero,
  DetailSection,
  PullToRefresh,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { BLOOD_GROUP_LABEL, GENDER_LABEL } from "@/constants";
import type { Staff } from "@/types";

export interface StaffMobileProfileProps {
  staff: Staff;
  fullName: string;
  roleLabel?: string;
  reportingToName?: string;
  onEdit: () => void;
  onRefresh: () => Promise<unknown> | void;
}

export function StaffMobileProfile({
  staff,
  fullName,
  roleLabel,
  reportingToName,
  onEdit,
  onRefresh,
}: StaffMobileProfileProps) {
  const phone = staff.phone_number
    ? `${staff.dial_code ?? ""}${staff.phone_number}`
    : null;
  const hasExperience =
    staff.previous_employer || staff.previous_role || staff.total_experience;

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <div className="flex flex-col gap-3 pt-3">
        <DetailHero
          name={fullName}
          image={staff.profile_image}
          subtitle={roleLabel}
          meta={
            staff.employee_code
              ? `Employee code ${staff.employee_code}`
              : undefined
          }
          badge={
            <Badge variant={staff.is_active ? "success" : "default"}>
              {staff.is_active ? "Active" : "Inactive"}
            </Badge>
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
            {
              label: "Email",
              icon: <Mail size={18} />,
              href: `mailto:${staff.email}`,
              hidden: !staff.email,
            },
            { label: "Edit", icon: <Pencil size={18} />, onClick: onEdit },
          ]}
        />

        <DetailSection title="Personal information" icon={<User size={18} />}>
          <DetailGrid>
            <DetailField
              label="Gender"
              value={
                staff.gender
                  ? GENDER_LABEL[staff.gender] ?? staff.gender
                  : undefined
              }
            />
            <DetailField
              label="Date of birth"
              value={formatDate(staff.date_of_birth)}
            />
            <DetailField
              label="Blood group"
              value={
                staff.blood_group
                  ? BLOOD_GROUP_LABEL[staff.blood_group] ?? staff.blood_group
                  : undefined
              }
            />
            <DetailField label="City" value={staff.city} />
            <DetailField label="Phone" value={phone} />
            <DetailField label="Email" value={staff.email} wide />
            <DetailField label="Father's name" value={staff.father_name} />
            <DetailField label="Husband's name" value={staff.husband_name} />
            <DetailField label="Address" value={staff.address} wide />
            <DetailField
              label="Permanent address"
              value={staff.permanent_address}
              wide
            />
          </DetailGrid>
        </DetailSection>

        <DetailSection title="Employment" icon={<Briefcase size={18} />}>
          <DetailGrid>
            <DetailField label="Role" value={roleLabel} />
            <DetailField label="Employee code" value={staff.employee_code} />
            <DetailField
              label="Joined"
              value={formatDate(staff.joining_date)}
            />
            <DetailField label="Reporting to" value={reportingToName} />
            <DetailField
              label="Qualification"
              value={staff.qualification}
              wide
            />
            <DetailField
              label="Smart card"
              value={staff.rfid_card_number}
              wide
            />
          </DetailGrid>
        </DetailSection>

        {hasExperience && (
          <DetailSection
            title="Work experience"
            icon={<History size={18} />}
            defaultOpen={false}
          >
            <DetailGrid>
              <DetailField
                label="Previous employer"
                value={staff.previous_employer}
                wide
              />
              <DetailField label="Previous role" value={staff.previous_role} />
              <DetailField
                label="Total experience"
                value={staff.total_experience}
              />
            </DetailGrid>
          </DetailSection>
        )}
      </div>
    </PullToRefresh>
  );
}
