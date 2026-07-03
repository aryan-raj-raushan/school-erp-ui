"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactBarcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Printer,
  Download,
  CreditCard,
  GraduationCap,
  MapPin,
  School,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useStudentCards, type CardMode } from "@/hooks/useStudentCard";
import { useStudents } from "@/hooks/useStudentV2";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  H3,
  P,
  Button,
  Spinner,
  FormField,
  Tabs,
  ResponsiveModalContainer,
  ResponsiveSelect,
} from "@/components/ui";
import {
  STUDENT_PAGE,
  STUDENT_ROUTES,
  CARD_TEMPLATES,
  type CardTemplateId,
} from "@/constants/students.constants";
import type {
  StudentIdCardData,
  PickupCardData,
  StudentParent,
} from "@/types/students.types";

// ─── Formatting helpers ─────────────────────────────────────────────────────

function formatBloodGroup(bg: string | null): string {
  if (!bg) return "—";
  return bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
}

function formatAddress(data: StudentIdCardData): string {
  const addr = data.address;
  if (!addr) return data.school_city ?? "—";
  return (
    [addr.address, addr.city, addr.state, addr.pincode]
      .filter(Boolean)
      .join(", ") || "—"
  );
}

function UserIconPlaceholder({
  size = 56,
  color = "#94a3b8",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="24" r="14" fill={color} opacity="0.6" />
      <ellipse cx="32" cy="54" rx="22" ry="14" fill={color} opacity="0.4" />
    </svg>
  );
}

// ─── Card themes ─────────────────────────────────────────────────────────────
// Twelve templates across seven distinct layout families — palette differs per
// template, structure differs per family.

type CardLayout =
  | "badge"
  | "ribbon"
  | "band"
  | "executive"
  | "crest"
  | "access"
  | "pastel";

interface CardTheme {
  layout: CardLayout;
  cardBg: string;
  headerBg: string;
  headerText: string;
  headerMuted: string;
  headerBorder?: string;
  panelBg: string;
  panelText?: string;
  accent: string;
  bodyText: string;
  mutedText: string;
  chipBg: string;
  chipBorder: string;
  divider: string;
  footerBg: string;
  footerText: string;
  footerMuted: string;
  punchHole?: string;
}

const CARD_THEMES: Record<CardTemplateId, CardTheme> = {
  classic: {
    layout: "badge",
    cardBg: "#ffffff",
    headerBg: "linear-gradient(135deg, #0b2545 0%, #163a63 100%)",
    headerText: "#ffffff",
    headerMuted: "rgba(255,255,255,0.55)",
    panelBg: "#0b2545",
    accent: "#c9a227",
    bodyText: "#0f172a",
    mutedText: "#64748b",
    chipBg: "#f8fafc",
    chipBorder: "#e2e8f0",
    divider: "rgba(201,162,39,0.35)",
    footerBg: "#0b2545",
    footerText: "rgba(255,255,255,0.85)",
    footerMuted: "rgba(255,255,255,0.4)",
    punchHole: "rgba(255,255,255,0.25)",
  },
  modern: {
    layout: "badge",
    cardBg: "#f8fafc",
    headerBg: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    headerText: "#ffffff",
    headerMuted: "rgba(255,255,255,0.5)",
    panelBg: "#0f172a",
    accent: "#06b6d4",
    bodyText: "#0f172a",
    mutedText: "#64748b",
    chipBg: "#ffffff",
    chipBorder: "#e2e8f0",
    divider: "rgba(6,182,212,0.3)",
    footerBg: "#0f172a",
    footerText: "rgba(255,255,255,0.85)",
    footerMuted: "rgba(255,255,255,0.35)",
    punchHole: "rgba(255,255,255,0.2)",
  },
  minimal: {
    layout: "badge",
    cardBg: "#ffffff",
    headerBg: "#ffffff",
    headerText: "#0f172a",
    headerMuted: "#94a3b8",
    headerBorder: "#e2e8f0",
    panelBg: "#ffffff",
    accent: "#334155",
    bodyText: "#0f172a",
    mutedText: "#64748b",
    chipBg: "#f8fafc",
    chipBorder: "#e2e8f0",
    divider: "#e2e8f0",
    footerBg: "#f8fafc",
    footerText: "#334155",
    footerMuted: "#94a3b8",
    punchHole: "rgba(15,23,42,0.08)",
  },
  "ribbon-crimson": {
    layout: "ribbon",
    cardBg: "#ffffff",
    headerBg: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)",
    headerText: "#ffffff",
    headerMuted: "rgba(255,255,255,0.6)",
    panelBg: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)",
    panelText: "#ffffff",
    accent: "#b91c1c",
    bodyText: "#1f2937",
    mutedText: "#6b7280",
    chipBg: "#fef2f2",
    chipBorder: "#fecaca",
    divider: "rgba(185,28,28,0.25)",
    footerBg: "#7f1d1d",
    footerText: "rgba(255,255,255,0.9)",
    footerMuted: "rgba(255,255,255,0.45)",
  },
  "ribbon-emerald": {
    layout: "ribbon",
    cardBg: "#ffffff",
    headerBg: "linear-gradient(135deg, #065f46 0%, #059669 100%)",
    headerText: "#ffffff",
    headerMuted: "rgba(255,255,255,0.6)",
    panelBg: "linear-gradient(135deg, #065f46 0%, #059669 100%)",
    panelText: "#ffffff",
    accent: "#059669",
    bodyText: "#1f2937",
    mutedText: "#6b7280",
    chipBg: "#ecfdf5",
    chipBorder: "#a7f3d0",
    divider: "rgba(5,150,105,0.25)",
    footerBg: "#065f46",
    footerText: "rgba(255,255,255,0.9)",
    footerMuted: "rgba(255,255,255,0.45)",
  },
  "band-indigo": {
    layout: "band",
    cardBg: "#ffffff",
    headerBg: "#ffffff",
    headerText: "#0f172a",
    headerMuted: "#64748b",
    panelBg: "#4f46e5",
    accent: "#4f46e5",
    bodyText: "#0f172a",
    mutedText: "#64748b",
    chipBg: "#eef2ff",
    chipBorder: "#e0e7ff",
    divider: "#e2e8f0",
    footerBg: "#ffffff",
    footerText: "#0f172a",
    footerMuted: "#94a3b8",
  },
  "band-amber": {
    layout: "band",
    cardBg: "#111827",
    headerBg: "#111827",
    headerText: "#f1f5f9",
    headerMuted: "#94a3b8",
    panelBg: "#f59e0b",
    accent: "#f59e0b",
    bodyText: "#f1f5f9",
    mutedText: "#94a3b8",
    chipBg: "#1f2937",
    chipBorder: "#374151",
    divider: "#374151",
    footerBg: "#111827",
    footerText: "#f1f5f9",
    footerMuted: "#94a3b8",
  },
  "executive-charcoal": {
    layout: "executive",
    cardBg: "#f8fafc",
    headerBg: "linear-gradient(160deg, #1f2937 0%, #111827 100%)",
    headerText: "#ffffff",
    headerMuted: "rgba(255,255,255,0.55)",
    panelBg: "linear-gradient(160deg, #1f2937 0%, #111827 100%)",
    panelText: "#ffffff",
    accent: "#94a3b8",
    bodyText: "#0f172a",
    mutedText: "#64748b",
    chipBg: "#ffffff",
    chipBorder: "#e2e8f0",
    divider: "#e2e8f0",
    footerBg: "#f8fafc",
    footerText: "#0f172a",
    footerMuted: "#94a3b8",
  },
  "executive-platinum": {
    layout: "executive",
    cardBg: "#eef2ff",
    headerBg: "linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 100%)",
    headerText: "#ffffff",
    headerMuted: "rgba(255,255,255,0.55)",
    panelBg: "linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 100%)",
    panelText: "#ffffff",
    accent: "#38bdf8",
    bodyText: "#0f172a",
    mutedText: "#64748b",
    chipBg: "#ffffff",
    chipBorder: "#dbeafe",
    divider: "#dbeafe",
    footerBg: "#eef2ff",
    footerText: "#1e3a8a",
    footerMuted: "#64748b",
  },
  "heritage-crest": {
    layout: "crest",
    cardBg: "#fbf7ee",
    headerBg: "#fbf7ee",
    headerText: "#241a12",
    headerMuted: "#8a7860",
    panelBg: "#fbf7ee",
    accent: "#b08d3f",
    bodyText: "#241a12",
    mutedText: "#8a7860",
    chipBg: "#f6efe0",
    chipBorder: "#e6d9bd",
    divider: "#e6d9bd",
    footerBg: "#fbf7ee",
    footerText: "#241a12",
    footerMuted: "#8a7860",
  },
  "secure-access": {
    layout: "access",
    cardBg: "#0b0f14",
    headerBg: "#0b0f14",
    headerText: "#e2e8f0",
    headerMuted: "#64748b",
    panelBg: "#0b0f14",
    accent: "#22d3ee",
    bodyText: "#e2e8f0",
    mutedText: "#94a3b8",
    chipBg: "#111827",
    chipBorder: "#1f2937",
    divider: "rgba(34,211,238,0.25)",
    footerBg: "#0b0f14",
    footerText: "#e2e8f0",
    footerMuted: "#64748b",
  },
  "junior-pastel": {
    layout: "pastel",
    cardBg: "#fff9f2",
    headerBg: "linear-gradient(135deg, #ffe1c9 0%, #c9ecff 100%)",
    headerText: "#334155",
    headerMuted: "#64748b",
    panelBg: "linear-gradient(135deg, #ffe1c9 0%, #c9ecff 100%)",
    accent: "#f59e0b",
    bodyText: "#334155",
    mutedText: "#94a3b8",
    chipBg: "#ffffff",
    chipBorder: "#ffe9d6",
    divider: "#ffe9d6",
    footerBg: "#fff9f2",
    footerText: "#334155",
    footerMuted: "#94a3b8",
  },
};

const LAYOUT_DIMS: Record<CardLayout, { w: number; h: number }> = {
  badge: { w: 300, h: 465 },
  ribbon: { w: 300, h: 450 },
  band: { w: 300, h: 420 },
  executive: { w: 440, h: 262 },
  crest: { w: 300, h: 470 },
  access: { w: 300, h: 460 },
  pastel: { w: 300, h: 430 },
};

// ─── Sample fixture (used only for the template gallery preview) ─────────────

const SAMPLE_STUDENT_CARD: StudentIdCardData = {
  id: "sample",
  system_number: 10234,
  first_name: "Aarav",
  last_name: "Mehta",
  profile_image: null,
  gender: "MALE",
  blood_group: "B_POSITIVE",
  phone_number: "+91 98765 43210",
  admission_number: "ADM-2026-0143",
  roll_number: "12",
  class_name: "Class 8",
  section_name: "B",
  school_name: "Greenfield Public School",
  school_address: null,
  school_city: "Ghaziabad",
  school_logo: null,
  school_phone: null,
  school_email: null,
  school_website: null,
  address: {
    id: "sample-addr",
    student_id: "sample",
    address: "221 Park Avenue",
    city: "Ghaziabad",
    state: "Uttar Pradesh",
    pincode: "201001",
    country: "India",
  },
};

const SAMPLE_PICKUP_CARD: PickupCardData = {
  student: SAMPLE_STUDENT_CARD,
  parents: [
    {
      id: "sample-p1",
      student_id: "sample",
      relation: "FATHER",
      first_name: "Rohit",
      last_name: "Mehta",
      email: null,
      dial_code: "+91",
      phone_number: "98765 11111",
      alternate_phone: null,
      occupation: null,
      qualification: null,
      annual_income: null,
      aadhaar_number: null,
      profile_image: null,
      is_primary: true,
      can_pickup: true,
    },
    {
      id: "sample-p2",
      student_id: "sample",
      relation: "MOTHER",
      first_name: "Neha",
      last_name: "Mehta",
      email: null,
      dial_code: "+91",
      phone_number: "98765 22222",
      alternate_phone: null,
      occupation: null,
      qualification: null,
      annual_income: null,
      aadhaar_number: null,
      profile_image: null,
      is_primary: false,
      can_pickup: true,
    },
  ],
};

// ─── Shared card atoms ─────────────────────────────────────────────────────
// Real, scannable codes — Code128 barcode (react-barcode) and a real QR code
// (qrcode.react) — rather than decorative placeholder bars.

function IdBarcode({ value, color }: { value: string; color: string }) {
  return (
    <ReactBarcode
      value={value || "N/A"}
      format="CODE128"
      width={1.15}
      height={22}
      margin={0}
      displayValue={false}
      background="transparent"
      lineColor={color}
    />
  );
}

function IdQrCode({ value, color, size = 96 }: { value: string; color: string; size?: number }) {
  return (
    <div style={{ padding: 6, background: "#ffffff", borderRadius: 8, lineHeight: 0 }}>
      <QRCodeSVG value={value || "N/A"} size={size - 12} bgColor="#ffffff" fgColor={color} level="M" />
    </div>
  );
}

function DetailCell({
  theme,
  label,
  value,
}: {
  theme: CardTheme;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p
        style={{
          color: theme.mutedText,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      <p
        style={{ color: theme.bodyText, fontSize: 12.5, fontWeight: 600, marginTop: 2 }}
        className="truncate"
      >
        {value}
      </p>
    </div>
  );
}

function InlineDetail({
  theme,
  label,
  value,
}: {
  theme: CardTheme;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span style={{ color: theme.mutedText, fontSize: 10.5 }}>{label}</span>
      <span
        style={{ color: theme.bodyText, fontSize: 11.5, fontWeight: 600 }}
        className="truncate text-right"
      >
        {value}
      </span>
    </div>
  );
}

function ParentRow({ theme, parent }: { theme: CardTheme; parent: StudentParent }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center shrink-0"
        style={{ background: theme.chipBg, border: `1.5px solid ${theme.chipBorder}` }}
      >
        {parent.profile_image ? (
          <img
            src={parent.profile_image}
            alt={parent.first_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <UserIconPlaceholder size={22} color={theme.mutedText} />
        )}
      </div>
      <div className="min-w-0">
        <p style={{ color: theme.bodyText, fontSize: 12.5, fontWeight: 600 }} className="truncate">
          {parent.first_name} {parent.last_name ?? ""}
        </p>
        <p style={{ color: theme.mutedText, fontSize: 10.5 }} className="truncate">
          {parent.relation} · {parent.phone_number}
        </p>
      </div>
    </div>
  );
}

function PickupParentList({ theme, data }: { theme: CardTheme; data: PickupCardData }) {
  const pickupParents = data.parents.filter((p) => p.can_pickup);
  if (pickupParents.length === 0) {
    return <p style={{ color: theme.mutedText, fontSize: 12 }}>No pickup contacts assigned</p>;
  }
  return (
    <div className="space-y-2.5">
      {pickupParents.slice(0, 3).map((p) => (
        <ParentRow key={p.id} theme={theme} parent={p} />
      ))}
    </div>
  );
}

// ─── Layout family: Badge (Classic / Modern / Minimal) ───────────────────────

function CardShell({
  theme,
  kicker,
  logo,
  schoolName,
  schoolCity,
  footerLeftLabel,
  footerLeftValue,
  children,
}: {
  theme: CardTheme;
  kicker: string;
  logo: string | null;
  schoolName: string;
  schoolCity: string;
  footerLeftLabel: string;
  footerLeftValue: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative w-[300px] rounded-[24px] overflow-hidden select-none"
      style={{
        background: theme.cardBg,
        boxShadow: "0 24px 48px -18px rgba(15,23,42,0.4), 0 0 0 1px rgba(15,23,42,0.05)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        className="absolute left-1/2 top-2 -translate-x-1/2 h-2 w-9 rounded-full z-10"
        style={{ background: theme.punchHole }}
      />

      <div
        className="pt-6 pb-3 px-5"
        style={{
          background: theme.headerBg,
          borderBottom: theme.headerBorder ? `1px solid ${theme.headerBorder}` : "none",
        }}
      >
        <div className="flex items-center gap-2.5">
          {logo ? (
            <img
              src={logo}
              alt="School"
              className="h-9 w-9 rounded-lg object-contain bg-white/90 p-1 shrink-0"
            />
          ) : (
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(148,163,184,0.15)" }}
            >
              <School size={16} color={theme.accent} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p style={{ color: theme.headerText, fontSize: 12.5, fontWeight: 700 }} className="truncate">
              {schoolName}
            </p>
            <p style={{ color: theme.headerMuted, fontSize: 9.5 }} className="truncate">
              {schoolCity}
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="h-[3px] w-5 rounded-full" style={{ background: theme.accent }} />
          <span style={{ color: theme.accent, fontSize: 9, fontWeight: 700, letterSpacing: 1.5 }}>
            {kicker}
          </span>
        </div>
      </div>

      <div className="px-5 py-4">{children}</div>

      <div
        className="px-5 pt-2.5 pb-3 flex items-end justify-between gap-3"
        style={{ background: theme.footerBg, borderTop: `1px solid ${theme.divider}` }}
      >
        <div className="min-w-0">
          <p style={{ color: theme.footerMuted, fontSize: 8.5, letterSpacing: 0.5 }}>{footerLeftLabel}</p>
          <p style={{ color: theme.footerText, fontSize: 10.5, fontWeight: 600 }} className="truncate">
            {footerLeftValue}
          </p>
        </div>
        <IdBarcode value={footerLeftValue} color={theme.footerText} />
      </div>
    </div>
  );
}

function StudentCardBody({ theme, data }: { theme: CardTheme; data: StudentIdCardData }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="h-24 w-24 rounded-2xl overflow-hidden flex items-center justify-center shrink-0"
        style={{ background: theme.chipBg, border: `3px solid ${theme.accent}` }}
      >
        {data.profile_image ? (
          <img src={data.profile_image} alt={data.first_name} className="h-full w-full object-cover" />
        ) : (
          <UserIconPlaceholder size={56} color={theme.mutedText} />
        )}
      </div>

      <p style={{ color: theme.bodyText, fontSize: 16, fontWeight: 700, marginTop: 10 }} className="truncate max-w-full">
        {data.first_name} {data.last_name ?? ""}
      </p>

      <span
        className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5"
        style={{ background: `${theme.accent}1f` }}
      >
        <GraduationCap size={11} color={theme.accent} />
        <span style={{ color: theme.accent, fontSize: 11, fontWeight: 700 }}>
          {data.class_name ?? "—"} · {data.section_name ?? "—"}
        </span>
      </span>

      <div className="w-full mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-left">
        <DetailCell theme={theme} label="Roll No." value={data.roll_number ?? "—"} />
        <DetailCell theme={theme} label="Blood Group" value={formatBloodGroup(data.blood_group)} />
        <DetailCell theme={theme} label="Adm. No." value={data.admission_number ?? "—"} />
        <DetailCell theme={theme} label="Contact" value={data.phone_number ?? "—"} />
      </div>

      <div
        className="w-full mt-3.5 pt-3 flex items-start gap-1.5 text-left"
        style={{ borderTop: `1px dashed ${theme.chipBorder}` }}
      >
        <MapPin size={11} color={theme.mutedText} className="shrink-0 mt-0.5" />
        <p style={{ color: theme.mutedText, fontSize: 10.5 }} className="truncate">
          {formatAddress(data)}
        </p>
      </div>
    </div>
  );
}

function PickupCardBody({ theme, data }: { theme: CardTheme; data: PickupCardData }) {
  const student = data.student;
  return (
    <div>
      <div
        className="rounded-xl px-3.5 py-3"
        style={{ background: theme.chipBg, border: `1px solid ${theme.chipBorder}` }}
      >
        <p style={{ color: theme.mutedText, fontSize: 9, fontWeight: 700, letterSpacing: 0.6 }}>STUDENT</p>
        <p style={{ color: theme.bodyText, fontSize: 14, fontWeight: 700, marginTop: 2 }} className="truncate">
          {student.first_name} {student.last_name ?? ""}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span style={{ color: theme.mutedText, fontSize: 11 }}>
            {student.class_name ?? "—"} · {student.section_name ?? "—"}
          </span>
          <span style={{ color: theme.mutedText, fontSize: 11 }}>Roll {student.roll_number ?? "—"}</span>
        </div>
      </div>

      <p
        style={{
          color: theme.mutedText,
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: 0.8,
          marginTop: 14,
          marginBottom: 8,
        }}
      >
        AUTHORISED FOR PICKUP
      </p>

      <PickupParentList theme={theme} data={data} />
    </div>
  );
}

// ─── Per-layout dispatch props ────────────────────────────────────────────────

interface LayoutProps {
  theme: CardTheme;
  mode: CardMode;
  idCardData: StudentIdCardData | null;
  pickupCardData: PickupCardData | null;
}

function BadgeCard({ theme, mode, idCardData, pickupCardData }: LayoutProps) {
  if (mode === "student" && idCardData) {
    return (
      <CardShell
        theme={theme}
        kicker="STUDENT IDENTITY CARD"
        logo={idCardData.school_logo}
        schoolName={idCardData.school_name ?? "School Name"}
        schoolCity={idCardData.school_city ?? ""}
        footerLeftLabel="Admission No."
        footerLeftValue={idCardData.admission_number ?? String(idCardData.system_number)}
      >
        <StudentCardBody theme={theme} data={idCardData} />
      </CardShell>
    );
  }
  if (mode === "pickup" && pickupCardData) {
    return (
      <CardShell
        theme={theme}
        kicker="PARENT PICKUP CARD"
        logo={pickupCardData.student.school_logo}
        schoolName={pickupCardData.student.school_name ?? "School Name"}
        schoolCity={pickupCardData.student.school_city ?? ""}
        footerLeftLabel="Admission No."
        footerLeftValue={pickupCardData.student.admission_number ?? String(pickupCardData.student.system_number)}
      >
        <PickupCardBody theme={theme} data={pickupCardData} />
      </CardShell>
    );
  }
  return null;
}

// ─── Layout family: Ribbon (diagonal corner banner) ───────────────────────────

function RibbonCard({ theme, mode, idCardData, pickupCardData }: LayoutProps) {
  const data = mode === "student" ? idCardData : (pickupCardData?.student ?? null);
  if (!data) return null;

  return (
    <div
      className="relative w-[300px] rounded-[20px] overflow-hidden select-none"
      style={{ background: theme.cardBg, boxShadow: "0 24px 48px -18px rgba(15,23,42,0.4)" }}
    >
      <div className="relative h-[108px] overflow-hidden" style={{ background: theme.panelBg }}>
        <div
          className="absolute -right-11 top-4 rotate-45 px-11 py-1"
          style={{ background: "rgba(0,0,0,0.18)" }}
        >
          <span style={{ color: theme.panelText ?? "#fff", fontSize: 9, fontWeight: 800, letterSpacing: 1.5 }}>
            {mode === "student" ? "STUDENT ID" : "PICKUP CARD"}
          </span>
        </div>
        <div className="absolute left-5 top-4 right-16 flex items-center gap-2">
          {data.school_logo ? (
            <img src={data.school_logo} alt="School" className="h-8 w-8 rounded-md object-contain bg-white/90 p-1 shrink-0" />
          ) : (
            <School size={16} color={theme.panelText ?? "#fff"} className="shrink-0" />
          )}
          <span
            style={{ color: theme.panelText ?? "#fff", fontSize: 11.5, fontWeight: 700 }}
            className="truncate"
          >
            {data.school_name ?? "School Name"}
          </span>
        </div>
      </div>

      <div className="flex justify-center -mt-10">
        <div
          className="h-20 w-20 rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: theme.chipBg, border: `4px solid ${theme.cardBg}`, boxShadow: `0 0 0 2px ${theme.accent}` }}
        >
          {data.profile_image ? (
            <img src={data.profile_image} alt={data.first_name} className="h-full w-full object-cover" />
          ) : (
            <UserIconPlaceholder size={40} color={theme.mutedText} />
          )}
        </div>
      </div>

      <div className="px-5 pt-2 pb-4 text-center">
        <p style={{ color: theme.bodyText, fontSize: 15.5, fontWeight: 700 }}>
          {data.first_name} {data.last_name ?? ""}
        </p>
        <p style={{ color: theme.accent, fontSize: 11.5, fontWeight: 700, marginTop: 2 }}>
          {data.class_name ?? "—"} · {data.section_name ?? "—"}
        </p>

        {mode === "student" && idCardData ? (
          <div className="mt-4 space-y-2 text-left">
            <InlineDetail theme={theme} label="Roll No." value={idCardData.roll_number ?? "—"} />
            <InlineDetail theme={theme} label="Admission No." value={idCardData.admission_number ?? "—"} />
            <InlineDetail theme={theme} label="Blood Group" value={formatBloodGroup(idCardData.blood_group)} />
            <InlineDetail theme={theme} label="Contact" value={idCardData.phone_number ?? "—"} />
          </div>
        ) : pickupCardData ? (
          <div className="mt-4 text-left">
            <p style={{ color: theme.mutedText, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8 }} className="mb-2">
              AUTHORISED FOR PICKUP
            </p>
            <PickupParentList theme={theme} data={pickupCardData} />
          </div>
        ) : null}
      </div>

      <div
        className="px-5 pt-2.5 pb-3 flex items-end justify-between gap-3"
        style={{ background: theme.footerBg, borderTop: `1px solid ${theme.divider}` }}
      >
        <div className="min-w-0">
          <p style={{ color: theme.footerMuted, fontSize: 8.5 }}>Adm. No.</p>
          <p style={{ color: theme.footerText, fontSize: 10.5, fontWeight: 600 }} className="truncate">
            {data.admission_number ?? "—"}
          </p>
        </div>
        <IdBarcode value={data.admission_number ?? String(data.system_number)} color={theme.footerText} />
      </div>
    </div>
  );
}

// ─── Layout family: Band (vertical side accent) ───────────────────────────────

function BandCard({ theme, mode, idCardData, pickupCardData }: LayoutProps) {
  const data = mode === "student" ? idCardData : (pickupCardData?.student ?? null);
  if (!data) return null;

  return (
    <div
      className="relative w-[300px] rounded-[18px] overflow-hidden flex select-none"
      style={{ background: theme.cardBg, boxShadow: "0 24px 48px -18px rgba(15,23,42,0.4)" }}
    >
      <div style={{ width: 14, background: theme.panelBg }} />
      <div className="flex-1 px-4 py-4 min-w-0">
        <div className="flex items-center gap-2">
          {data.school_logo ? (
            <img src={data.school_logo} alt="School" className="h-7 w-7 rounded object-contain shrink-0" />
          ) : (
            <School size={14} color={theme.accent} className="shrink-0" />
          )}
          <p
            style={{ color: theme.mutedText, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8 }}
            className="truncate uppercase"
          >
            {data.school_name ?? "School Name"}
          </p>
        </div>

        <div className="mt-4 flex gap-3 items-start">
          <div
            className="h-16 w-16 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
            style={{ background: theme.chipBg, border: `1.5px solid ${theme.chipBorder}` }}
          >
            {data.profile_image ? (
              <img src={data.profile_image} alt={data.first_name} className="h-full w-full object-cover" />
            ) : (
              <UserIconPlaceholder size={34} color={theme.mutedText} />
            )}
          </div>
          <div className="min-w-0 pt-1">
            <p style={{ color: theme.bodyText, fontSize: 14.5, fontWeight: 700 }} className="truncate">
              {data.first_name} {data.last_name ?? ""}
            </p>
            <p style={{ color: theme.accent, fontSize: 11, fontWeight: 700, marginTop: 2 }}>
              {data.class_name ?? "—"} · {data.section_name ?? "—"}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {mode === "student" && idCardData ? (
            <>
              <InlineDetail theme={theme} label="Roll No." value={idCardData.roll_number ?? "—"} />
              <InlineDetail theme={theme} label="Blood Group" value={formatBloodGroup(idCardData.blood_group)} />
              <InlineDetail theme={theme} label="Contact" value={idCardData.phone_number ?? "—"} />
              <div
                className="pt-2 mt-1 flex items-start gap-1.5"
                style={{ borderTop: `1px dashed ${theme.chipBorder}` }}
              >
                <MapPin size={11} color={theme.mutedText} className="shrink-0 mt-0.5" />
                <p style={{ color: theme.mutedText, fontSize: 10.5 }} className="truncate">
                  {formatAddress(idCardData)}
                </p>
              </div>
            </>
          ) : pickupCardData ? (
            <>
              <p style={{ color: theme.mutedText, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8 }}>
                AUTHORISED FOR PICKUP
              </p>
              <div className="pt-1">
                <PickupParentList theme={theme} data={pickupCardData} />
              </div>
            </>
          ) : null}
        </div>

        <div
          className="mt-4 pt-3 flex items-end justify-between"
          style={{ borderTop: `1px solid ${theme.divider}` }}
        >
          <div>
            <p style={{ color: theme.mutedText, fontSize: 8.5 }}>Adm. No.</p>
            <p style={{ color: theme.bodyText, fontSize: 10.5, fontWeight: 600 }}>
              {data.admission_number ?? "—"}
            </p>
          </div>
          <IdBarcode value={data.admission_number ?? String(data.system_number)} color={theme.accent} />
        </div>
      </div>
    </div>
  );
}

// ─── Layout family: Executive (landscape corporate badge) ────────────────────

function ExecutiveCard({ theme, mode, idCardData, pickupCardData }: LayoutProps) {
  const data = mode === "student" ? idCardData : (pickupCardData?.student ?? null);
  if (!data) return null;

  return (
    <div
      className="relative w-[440px] rounded-[18px] overflow-hidden flex select-none"
      style={{ background: theme.cardBg, boxShadow: "0 24px 48px -18px rgba(15,23,42,0.4)" }}
    >
      <div
        className="w-[160px] shrink-0 flex flex-col items-center justify-center px-4 py-5 text-center"
        style={{ background: theme.panelBg }}
      >
        <div
          className="h-20 w-20 rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.1)", border: `2px solid ${theme.accent}` }}
        >
          {data.profile_image ? (
            <img src={data.profile_image} alt={data.first_name} className="h-full w-full object-cover" />
          ) : (
            <UserIconPlaceholder size={44} color={theme.accent} />
          )}
        </div>
        <p
          style={{ color: theme.panelText ?? "#fff", fontSize: 13, fontWeight: 700, marginTop: 10 }}
          className="truncate max-w-full"
        >
          {data.first_name} {data.last_name ?? ""}
        </p>
        <span className="mt-1.5 inline-flex rounded-full px-2 py-0.5" style={{ background: "rgba(255,255,255,0.15)" }}>
          <span style={{ color: theme.accent, fontSize: 10, fontWeight: 700 }}>
            {data.class_name ?? "—"}-{data.section_name ?? "—"}
          </span>
        </span>
      </div>

      <div className="flex-1 px-4 py-4 flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          {data.school_logo ? (
            <img src={data.school_logo} alt="School" className="h-6 w-6 rounded object-contain shrink-0" />
          ) : (
            <School size={14} color={theme.accent} className="shrink-0" />
          )}
          <p style={{ color: theme.bodyText, fontSize: 11.5, fontWeight: 700 }} className="truncate">
            {data.school_name ?? "School Name"}
          </p>
          <span
            style={{ color: theme.mutedText, fontSize: 8.5, fontWeight: 700, letterSpacing: 1, marginLeft: "auto" }}
            className="shrink-0"
          >
            {mode === "student" ? "STUDENT ID CARD" : "PICKUP CARD"}
          </span>
        </div>

        <div className="flex-1 mt-3">
          {mode === "student" && idCardData ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
              <DetailCell theme={theme} label="Roll No." value={idCardData.roll_number ?? "—"} />
              <DetailCell theme={theme} label="Blood Group" value={formatBloodGroup(idCardData.blood_group)} />
              <DetailCell theme={theme} label="Adm. No." value={idCardData.admission_number ?? "—"} />
              <DetailCell theme={theme} label="Contact" value={idCardData.phone_number ?? "—"} />
            </div>
          ) : pickupCardData ? (
            <div className="space-y-2">
              <p style={{ color: theme.mutedText, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8 }}>
                AUTHORISED FOR PICKUP
              </p>
              <PickupParentList theme={theme} data={pickupCardData} />
            </div>
          ) : null}
        </div>

        <div className="pt-2 flex items-end justify-between" style={{ borderTop: `1px solid ${theme.divider}` }}>
          <p style={{ color: theme.mutedText, fontSize: 9.5 }}>#{data.system_number}</p>
          <IdBarcode value={data.admission_number ?? String(data.system_number)} color={theme.accent} />
        </div>
      </div>
    </div>
  );
}

// ─── Layout family: Crest (formal / heritage) ─────────────────────────────────

function CrestCard({ theme, mode, idCardData, pickupCardData }: LayoutProps) {
  const data = mode === "student" ? idCardData : (pickupCardData?.student ?? null);
  if (!data) return null;

  return (
    <div
      className="relative w-[300px] rounded-[10px] overflow-hidden select-none"
      style={{ background: theme.cardBg, boxShadow: "0 24px 48px -18px rgba(15,23,42,0.35)" }}
    >
      <div className="m-2 rounded-[6px]" style={{ border: `1.5px solid ${theme.accent}`, padding: "18px 20px 16px" }}>
        <div className="flex flex-col items-center text-center">
          {data.school_logo ? (
            <img src={data.school_logo} alt="School" className="h-9 w-9 object-contain mb-1.5" />
          ) : (
            <GraduationCap size={26} color={theme.accent} className="mb-1.5" />
          )}
          <p
            style={{ color: theme.bodyText, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.5 }}
            className="uppercase truncate max-w-full font-serif"
          >
            {data.school_name ?? "School Name"}
          </p>
          <span className="mt-1 h-px w-10" style={{ background: theme.accent }} />

          <div className="relative mt-4">
            <GraduationCap
              size={110}
              color={theme.accent}
              className="absolute opacity-[0.08] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            />
            <div
              className="relative h-24 w-24 rounded-full overflow-hidden flex items-center justify-center"
              style={{ background: theme.chipBg, border: `3px double ${theme.accent}` }}
            >
              {data.profile_image ? (
                <img src={data.profile_image} alt={data.first_name} className="h-full w-full object-cover" />
              ) : (
                <UserIconPlaceholder size={54} color={theme.mutedText} />
              )}
            </div>
          </div>

          <p className="font-serif" style={{ color: theme.bodyText, fontSize: 16, fontWeight: 700, marginTop: 10 }}>
            {data.first_name} {data.last_name ?? ""}
          </p>
          <p style={{ color: theme.accent, fontSize: 11.5, fontWeight: 600, marginTop: 1 }}>
            {data.class_name ?? "—"} · Section {data.section_name ?? "—"}
          </p>

          {mode === "student" && idCardData ? (
            <div className="mt-3.5 flex items-center gap-2 flex-wrap justify-center">
              <span style={{ color: theme.mutedText, fontSize: 10.5 }}>Roll {idCardData.roll_number ?? "—"}</span>
              <span style={{ color: theme.chipBorder }}>•</span>
              <span style={{ color: theme.mutedText, fontSize: 10.5 }}>Adm {idCardData.admission_number ?? "—"}</span>
              <span style={{ color: theme.chipBorder }}>•</span>
              <span style={{ color: theme.mutedText, fontSize: 10.5 }}>{formatBloodGroup(idCardData.blood_group)}</span>
            </div>
          ) : pickupCardData ? (
            <div className="mt-3.5 w-full text-left">
              <p
                style={{ color: theme.mutedText, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8 }}
                className="text-center mb-2"
              >
                AUTHORISED FOR PICKUP
              </p>
              <PickupParentList theme={theme} data={pickupCardData} />
            </div>
          ) : null}

          <div
            className="mt-4 pt-3 w-full flex flex-col items-center gap-1"
            style={{ borderTop: `1px dashed ${theme.chipBorder}` }}
          >
            <IdBarcode value={data.admission_number ?? String(data.system_number)} color={theme.accent} />
            <p style={{ color: theme.mutedText, fontSize: 9, letterSpacing: 0.5, marginTop: 2 }}>
              AUTHORIZED SIGNATORY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Layout family: Secure Access (QR verification) ───────────────────────────

function AccessCard({ theme, mode, idCardData, pickupCardData }: LayoutProps) {
  const data = mode === "student" ? idCardData : (pickupCardData?.student ?? null);
  if (!data) return null;

  return (
    <div
      className="relative w-[300px] rounded-[20px] overflow-hidden select-none"
      style={{ background: theme.cardBg, boxShadow: "0 24px 48px -18px rgba(0,0,0,0.5)" }}
    >
      <div className="px-5 pt-5 pb-3 flex items-center gap-3" style={{ borderBottom: `1px solid ${theme.divider}` }}>
        {data.school_logo ? (
          <img src={data.school_logo} alt="School" className="h-9 w-9 rounded-lg object-contain bg-white/10 p-1 shrink-0" />
        ) : (
          <ShieldCheck size={20} color={theme.accent} className="shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p style={{ color: theme.bodyText, fontSize: 12.5, fontWeight: 700 }} className="truncate">
            {data.school_name ?? "School Name"}
          </p>
          <p style={{ color: theme.accent, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.5 }}>
            {mode === "student" ? "ACCESS · STUDENT" : "ACCESS · PICKUP"}
          </p>
        </div>
      </div>

      <div className="px-5 py-4 flex items-center gap-3">
        <div
          className="h-16 w-16 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", border: `2px solid ${theme.accent}` }}
        >
          {data.profile_image ? (
            <img src={data.profile_image} alt={data.first_name} className="h-full w-full object-cover" />
          ) : (
            <UserIconPlaceholder size={36} color={theme.accent} />
          )}
        </div>
        <div className="min-w-0">
          <p style={{ color: theme.bodyText, fontSize: 14.5, fontWeight: 700 }} className="truncate">
            {data.first_name} {data.last_name ?? ""}
          </p>
          <p style={{ color: theme.mutedText, fontSize: 11 }}>
            {data.class_name ?? "—"} · {data.section_name ?? "—"}
          </p>
        </div>
      </div>

      <div className="px-5 pb-2 flex items-center justify-center">
        <IdQrCode value={data.admission_number ?? String(data.system_number)} color={theme.accent} size={104} />
      </div>
      <p style={{ color: theme.mutedText, fontSize: 9, letterSpacing: 1.2, textAlign: "center" }}>
        SCAN TO VERIFY IDENTITY
      </p>

      <div className="px-5 mt-3 pt-3 pb-3" style={{ borderTop: `1px solid ${theme.divider}` }}>
        {mode === "student" && idCardData ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <DetailCell theme={theme} label="Roll No." value={idCardData.roll_number ?? "—"} />
            <DetailCell theme={theme} label="Adm. No." value={idCardData.admission_number ?? "—"} />
          </div>
        ) : pickupCardData ? (
          <PickupParentList theme={theme} data={pickupCardData} />
        ) : null}
      </div>

      <div className="px-5 pb-4 flex items-center justify-between">
        <IdBarcode value={data.admission_number ?? String(data.system_number)} color={theme.accent} />
        <span style={{ color: theme.mutedText, fontSize: 10 }}>#{data.system_number}</span>
      </div>
    </div>
  );
}

// ─── Layout family: Pastel (junior / softer grades) ───────────────────────────

function PastelCard({ theme, mode, idCardData, pickupCardData }: LayoutProps) {
  const data = mode === "student" ? idCardData : (pickupCardData?.student ?? null);
  if (!data) return null;

  return (
    <div
      className="relative w-[300px] rounded-[28px] overflow-hidden select-none"
      style={{ background: theme.cardBg, boxShadow: "0 20px 40px -16px rgba(15,23,42,0.25)" }}
    >
      <div className="px-5 pt-5 pb-4 text-center" style={{ background: theme.panelBg }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          {data.school_logo ? (
            <img src={data.school_logo} alt="School" className="h-7 w-7 rounded-full object-contain bg-white/70 p-1" />
          ) : (
            <School size={14} color={theme.accent} />
          )}
          <span style={{ color: theme.bodyText, fontSize: 11.5, fontWeight: 700 }} className="truncate max-w-[180px]">
            {data.school_name ?? "School Name"}
          </span>
        </div>
        <div className="flex justify-center">
          <div
            className="h-24 w-24 rounded-full overflow-hidden flex items-center justify-center"
            style={{ background: "#ffffff", border: `4px dashed ${theme.accent}` }}
          >
            {data.profile_image ? (
              <img src={data.profile_image} alt={data.first_name} className="h-full w-full object-cover" />
            ) : (
              <UserIconPlaceholder size={54} color={theme.mutedText} />
            )}
          </div>
        </div>
        <p style={{ color: theme.bodyText, fontSize: 16, fontWeight: 800, marginTop: 10 }}>
          {data.first_name} {data.last_name ?? ""}
        </p>
        <span className="mt-1.5 inline-flex items-center rounded-full px-3 py-1" style={{ background: "#ffffff" }}>
          <span style={{ color: theme.accent, fontSize: 11.5, fontWeight: 700 }}>
            {data.class_name ?? "—"} · {data.section_name ?? "—"}
          </span>
        </span>
      </div>

      <div className="px-5 py-4">
        {mode === "student" && idCardData ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            <DetailCell theme={theme} label="Roll No." value={idCardData.roll_number ?? "—"} />
            <DetailCell theme={theme} label="Blood Group" value={formatBloodGroup(idCardData.blood_group)} />
          </div>
        ) : pickupCardData ? (
          <div className="space-y-2.5">
            <p style={{ color: theme.mutedText, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8 }}>
              AUTHORISED FOR PICKUP
            </p>
            <PickupParentList theme={theme} data={pickupCardData} />
          </div>
        ) : null}
      </div>

      <div className="px-5 pb-4 flex items-center justify-between">
        <span style={{ color: theme.mutedText, fontSize: 10 }}>Adm: {data.admission_number ?? "—"}</span>
        <IdBarcode value={data.admission_number ?? String(data.system_number)} color={theme.accent} />
      </div>
    </div>
  );
}

// ─── Card renderer (delegates to correct layout family) ──────────────────────

function CardPreview({
  template,
  mode,
  idCardData,
  pickupCardData,
}: {
  template: CardTemplateId;
  mode: CardMode;
  idCardData: StudentIdCardData | null;
  pickupCardData: PickupCardData | null;
}) {
  const theme = CARD_THEMES[template];
  if (mode === "student" && !idCardData) return null;
  if (mode === "pickup" && !pickupCardData) return null;

  const props: LayoutProps = { theme, mode, idCardData, pickupCardData };
  switch (theme.layout) {
    case "badge":
      return <BadgeCard {...props} />;
    case "ribbon":
      return <RibbonCard {...props} />;
    case "band":
      return <BandCard {...props} />;
    case "executive":
      return <ExecutiveCard {...props} />;
    case "crest":
      return <CrestCard {...props} />;
    case "access":
      return <AccessCard {...props} />;
    case "pastel":
      return <PastelCard {...props} />;
    default:
      return null;
  }
}

function TemplateThumb({ templateId, mode }: { templateId: CardTemplateId; mode: CardMode }) {
  const theme = CARD_THEMES[templateId];
  const dims = LAYOUT_DIMS[theme.layout];
  const scale = Math.min(150 / dims.w, 172 / dims.h);

  return (
    <div
      className="w-full flex items-center justify-center overflow-hidden rounded-lg"
      style={{ height: 176, background: "hsl(var(--muted) / 0.35)" }}
    >
      <div style={{ transform: `scale(${scale})`, width: dims.w }}>
        <CardPreview
          template={templateId}
          mode={mode}
          idCardData={SAMPLE_STUDENT_CARD}
          pickupCardData={SAMPLE_PICKUP_CARD}
        />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function GeneratePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get("studentId");
  const printRef = useRef<HTMLDivElement>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const {
    selectedStudentId,
    selectedTemplate,
    setSelectedTemplate,
    cardMode,
    setCardMode,
    idCardData,
    pickupCardData,
    isLoading: isCardLoading,
    loadCardData,
  } = useStudentCards();

  const {
    years,
    classes,
    sections,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    selectedClassId,
    selectedSectionId,
    handleClassChange,
    handleSectionChange,
    isLoadingClasses,
  } = useAcademicClassSection();

  const { students, isLoading: isStudentsLoading, updateFilters } = useStudents({
    is_enabled: true,
  });

  // Fetch students for the chosen academic year / class / section only.
  useEffect(() => {
    if (selectedClassId) {
      updateFilters({
        academic_year_id: selectedAcademicYearId || undefined,
        class_id: selectedClassId,
        section_id: selectedSectionId || undefined,
      });
    }
  }, [selectedAcademicYearId, selectedClassId, selectedSectionId]); // eslint-disable-line

  // Auto-load if arriving from a student row action.
  useEffect(() => {
    if (preselectedStudentId) {
      loadCardData(preselectedStudentId);
    }
  }, [preselectedStudentId]); // eslint-disable-line

  const hasData = cardMode === "student" ? !!idCardData : !!pickupCardData;
  const currentTemplate = CARD_TEMPLATES.find((t) => t.id === selectedTemplate);

  function handlePrint() {
    window.print();
  }

  const cardTabs = [
    { value: "student" as CardMode, label: STUDENT_PAGE.buttons.generateIdCard },
    { value: "pickup" as CardMode, label: STUDENT_PAGE.buttons.generatePickupCard },
  ];

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #card-print-area, #card-print-area * { visibility: visible !important; }
          #card-print-area {
            position: fixed !important;
            inset: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: white !important;
          }
        }
      `}</style>

      <Div type="col" gap="md">
        <PageHeader
          title={STUDENT_PAGE.generate.title}
          subtitle={STUDENT_PAGE.generate.subtitle}
          actions={
            <Button variant="outline" size="sm" onClick={() => router.push(STUDENT_ROUTES.list)}>
              <ArrowLeft size={14} />
              {STUDENT_PAGE.buttons.back}
            </Button>
          }
        />

        {/* ── Class & student selection ─────────────────────────────────── */}
        <Div className="rounded-xl border border-border bg-card px-4 py-3" type="col" gap="xs">
          <H3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Class &amp; Student
          </H3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <FormField label="Academic Year">
              <ResponsiveSelect
                value={selectedAcademicYearId}
                onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                customPlaceholder="Select year"
                options={years.map((y) => ({
                  value: y.id,
                  label: `${y.name}${y.is_current ? " (Current)" : ""}`,
                }))}
              />
            </FormField>

            <FormField label="Class">
              <ResponsiveSelect
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                disabled={!selectedAcademicYearId || isLoadingClasses}
                customPlaceholder="Select class"
                options={classes.map((c) => ({ value: c.id, label: c.name }))}
              />
            </FormField>

            <FormField label="Section">
              <ResponsiveSelect
                value={selectedSectionId}
                onChange={(e) => handleSectionChange(e.target.value)}
                disabled={!selectedClassId}
                customPlaceholder="All sections"
                options={sections.map((s) => ({ value: s.id, label: s.name }))}
              />
            </FormField>

            <FormField label="Student">
              <ResponsiveSelect
                value={selectedStudentId ?? ""}
                onChange={(e) => e.target.value && loadCardData(e.target.value)}
                disabled={!selectedClassId || isStudentsLoading}
                customPlaceholder={!selectedClassId ? "Select a class first" : "Select student"}
                options={students.map((s) => ({
                  value: s.id,
                  label: `${s.first_name} ${s.last_name ?? ""}${s.roll_number ? ` — Roll ${s.roll_number}` : ""}`,
                }))}
              />
            </FormField>
          </div>
        </Div>

        {/* ── Card type / template / actions ────────────────────────────── */}
        <Div
          className="rounded-xl border border-border bg-card px-4 py-3"
          type="row"
          align="center"
          justify="between"
          wrap
          gap="md"
        >
          <Div type="row" align="center" gap="sm">
            <P color="muted" className="text-[11px] font-semibold uppercase tracking-wider shrink-0">
              Card Type
            </P>
            <Tabs options={cardTabs} value={cardMode} onChange={setCardMode} className="w-64" />
          </Div>

          <Div type="row" align="center" gap="sm">
            <P color="muted" className="text-[11px] font-semibold uppercase tracking-wider shrink-0">
              {STUDENT_PAGE.generate.chooseTemplate}
            </P>
            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted/50 transition-colors"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              <span
                className="h-3.5 w-3.5 rounded-full shrink-0"
                style={{ background: CARD_THEMES[selectedTemplate].accent }}
              />
              <span className="text-sm font-medium text-foreground">{currentTemplate?.label}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
          </Div>

          <Div type="row" align="center" gap="sm">
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={!hasData}>
              <Printer size={14} />
              {STUDENT_PAGE.buttons.printCard}
            </Button>
            <Button size="sm" onClick={handlePrint} disabled={!hasData}>
              <Download size={14} />
              {STUDENT_PAGE.buttons.downloadCard}
            </Button>
          </Div>
        </Div>

        {/* ── Preview ──────────────────────────────────────────────────── */}
        <Div
          type="col"
          align="center"
          justify="center"
          className="flex-1 rounded-2xl py-10"
          style={{ background: "hsl(var(--muted) / 0.25)", border: "1px dashed hsl(var(--border))" }}
        >
          {isCardLoading ? (
            <Div type="col" align="center" gap="md">
              <Spinner size="lg" />
              <P color="muted">Loading card data…</P>
            </Div>
          ) : !selectedStudentId ? (
            <Div type="col" align="center" gap="md" className="px-8 text-center">
              <Div
                className="h-14 w-14 rounded-2xl flex items-center justify-center"
                style={{ background: "hsl(var(--muted))" }}
              >
                <CreditCard size={26} className="text-muted-foreground" />
              </Div>
              <P color="muted">{STUDENT_PAGE.generate.noStudent}</P>
            </Div>
          ) : (
            <div id="card-print-area" ref={printRef}>
              <CardPreview
                template={selectedTemplate}
                mode={cardMode}
                idCardData={idCardData}
                pickupCardData={pickupCardData}
              />
            </div>
          )}
        </Div>
      </Div>

      {/* ── Template sandbox modal ────────────────────────────────────── */}
      <ResponsiveModalContainer
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        title="Template Sandbox"
      >
        <div className="px-4 py-4">
          <P color="muted" className="text-xs mb-3">
            Pick a design for the {cardMode === "student" ? "Student ID Card" : "Pickup Card"}. Previews use sample data.
          </P>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CARD_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelectedTemplate(t.id);
                  setGalleryOpen(false);
                }}
                className="text-left rounded-xl border p-2.5 transition-all hover:shadow-md"
                style={{
                  borderColor: selectedTemplate === t.id ? "hsl(var(--primary))" : "hsl(var(--border))",
                  background: selectedTemplate === t.id ? "hsl(var(--primary) / 0.05)" : "hsl(var(--card))",
                }}
              >
                <TemplateThumb templateId={t.id} mode={cardMode} />
                <p className="text-xs font-semibold text-foreground mt-2">{t.label}</p>
                <p className="text-[10.5px] text-muted-foreground mt-0.5 leading-snug">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
      </ResponsiveModalContainer>
    </>
  );
}

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <GeneratePageContent />
    </Suspense>
  );
}
