"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Download,
  CreditCard,
  Users,
  GraduationCap,
  Phone,
  MapPin,
  Hash,
  Droplets,
  School,
} from "lucide-react";
import { useStudentCards, type CardMode } from "@/hooks/useStudentCard";
import { useStudents } from "@/hooks/useStudentV2";
import { PageHeader } from "@/components/ui/page-header";
import { Div, H3, P, Button, Spinner } from "@/components/ui";
import {
  STUDENT_PAGE,
  STUDENT_ROUTES,
  CARD_TEMPLATES,
  type CardTemplateId,
} from "@/constants/students-v2.constants";
import type { StudentIdCardData, PickupCardData } from "@/types/students.types";

// ─── Blood group display helper ────────────────────────────────────────────────

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

// ─── User Icon SVG (fallback when no photo) ───────────────────────────────────

function UserIconPlaceholder({
  size = 64,
  color = "#94a3b8",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="24" r="14" fill={color} opacity="0.7" />
      <ellipse cx="32" cy="54" rx="22" ry="14" fill={color} opacity="0.5" />
    </svg>
  );
}

// ─── TEMPLATE 1 — Classic ──────────────────────────────────────────────────────
// Deep navy gradient, gold accent strip, official feel

function ClassicStudentCard({ data }: { data: StudentIdCardData }) {
  return (
    <div
      className="relative w-[340px] rounded-2xl overflow-hidden shadow-2xl select-none"
      style={{
        background: "linear-gradient(160deg, #1e3a5f 0%, #0f1f35 100%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Gold accent bar */}
      <div
        style={{
          height: 4,
          background: "linear-gradient(90deg, #f59e0b, #fcd34d, #f59e0b)",
        }}
      />

      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          {data.school_logo ? (
            <img
              src={data.school_logo}
              alt="School"
              className="h-10 w-10 rounded-lg object-contain bg-white p-1 shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <School size={20} color="#fcd34d" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">
              {data.school_name ?? "School Name"}
            </p>
            <p className="text-amber-300 text-xs truncate">
              {data.school_city ?? ""}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(252,211,77,0.3)",
          margin: "0 20px",
        }}
      />

      {/* Body */}
      <div className="px-5 py-4 flex gap-4">
        {/* Photo */}
        <div className="shrink-0">
          <div
            className="h-20 w-20 rounded-xl overflow-hidden flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "2px solid rgba(252,211,77,0.5)",
            }}
          >
            {data.profile_image ? (
              <img
                src={data.profile_image}
                alt={data.first_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIconPlaceholder size={48} color="#fcd34d" />
            )}
          </div>
          <div className="mt-2 text-center">
            <p
              style={{
                color: "#fcd34d",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              STUDENT
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-base leading-tight truncate">
            {data.first_name} {data.last_name ?? ""}
          </p>
          <div className="mt-2 space-y-1.5">
            <InfoRow
              icon={<GraduationCap size={11} color="#fcd34d" />}
              label="Class"
              value={`${data.class_name ?? "—"} — ${data.section_name ?? "—"}`}
            />
            <InfoRow
              icon={<Hash size={11} color="#fcd34d" />}
              label="Roll No."
              value={data.roll_number ?? "—"}
            />
            <InfoRow
              icon={<Droplets size={11} color="#fcd34d" />}
              label="Blood"
              value={formatBloodGroup(data.blood_group)}
            />
            <InfoRow
              icon={<Phone size={11} color="#fcd34d" />}
              label="Contact"
              value={data.phone_number ?? "—"}
            />
            <InfoRow
              icon={<MapPin size={11} color="#fcd34d" />}
              label="Address"
              value={formatAddress(data)}
              truncate
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          background: "rgba(252,211,77,0.1)",
          borderTop: "1px solid rgba(252,211,77,0.2)",
        }}
        className="px-5 py-2.5 flex justify-between items-center"
      >
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>
          Adm: {data.admission_number ?? "—"}
        </p>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>
          #{data.system_number}
        </p>
      </div>
    </div>
  );
}

function ClassicPickupCard({ data }: { data: PickupCardData }) {
  const primaryParent =
    data.parents.find((p) => p.is_primary) ?? data.parents[0];
  const pickupParents = data.parents.filter((p) => p.can_pickup);

  return (
    <div
      className="relative w-[340px] rounded-2xl overflow-hidden shadow-2xl select-none"
      style={{
        background: "linear-gradient(160deg, #1e3a5f 0%, #0f1f35 100%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          height: 4,
          background: "linear-gradient(90deg, #10b981, #34d399, #10b981)",
        }}
      />

      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          {data.student.school_logo ? (
            <img
              src={data.student.school_logo}
              alt="School"
              className="h-10 w-10 rounded-lg object-contain bg-white p-1 shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <School size={20} color="#34d399" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">
              {data.student.school_name ?? "School Name"}
            </p>
            <p style={{ color: "#34d399", fontSize: 11 }}>PARENT PICKUP CARD</p>
          </div>
        </div>
      </div>

      <div
        style={{
          height: 1,
          background: "rgba(52,211,153,0.3)",
          margin: "0 20px",
        }}
      />

      {/* Student summary */}
      <div className="px-5 py-3">
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 10,
            letterSpacing: 1,
            fontWeight: 600,
          }}
        >
          STUDENT
        </p>
        <p className="text-white font-bold text-base mt-0.5">
          {data.student.first_name} {data.student.last_name ?? ""}
        </p>
        <div className="flex gap-4 mt-1">
          <InfoRow
            icon={<GraduationCap size={11} color="#34d399" />}
            label="Class"
            value={`${data.student.class_name ?? "—"} — ${data.student.section_name ?? "—"}`}
          />
          <InfoRow
            icon={<Hash size={11} color="#34d399" />}
            label="Roll"
            value={data.student.roll_number ?? "—"}
          />
        </div>
      </div>

      <div
        style={{
          height: 1,
          background: "rgba(52,211,153,0.2)",
          margin: "0 20px",
        }}
      />

      {/* Parents */}
      <div className="px-5 py-3 space-y-2">
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 10,
            letterSpacing: 1,
            fontWeight: 600,
          }}
        >
          AUTHORISED FOR PICKUP
        </p>
        {pickupParents.length === 0 ? (
          <p className="text-white/40 text-xs">No pickup contacts assigned</p>
        ) : (
          pickupParents.slice(0, 3).map((parent) => (
            <div key={parent.id} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                {parent.profile_image ? (
                  <img
                    src={parent.profile_image}
                    alt={parent.first_name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <UserIconPlaceholder size={24} color="#34d399" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {parent.first_name} {parent.last_name ?? ""}
                </p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
                  {parent.relation} · {parent.phone_number}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          background: "rgba(52,211,153,0.1)",
          borderTop: "1px solid rgba(52,211,153,0.2)",
        }}
        className="px-5 py-2.5 flex justify-between items-center"
      >
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>
          Adm: {data.student.admission_number ?? "—"}
        </p>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>
          #{data.student.system_number}
        </p>
      </div>
    </div>
  );
}

// ─── TEMPLATE 2 — Modern ──────────────────────────────────────────────────────
// Near-black background, vivid teal/cyan accent, bold name treatment

function ModernStudentCard({ data }: { data: StudentIdCardData }) {
  return (
    <div
      className="relative w-[340px] rounded-2xl overflow-hidden shadow-2xl select-none"
      style={{ background: "#0d0d0d", fontFamily: "system-ui, sans-serif" }}
    >
      {/* Vivid top band */}
      <div
        style={{
          background: "linear-gradient(90deg, #06b6d4, #8b5cf6)",
          height: 6,
        }}
      />

      {/* Photo + name hero */}
      <div
        className="px-5 pt-5 pb-4 flex gap-4 items-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(6,182,212,0.08) 0%, transparent 60%)",
        }}
      >
        <div
          className="h-[72px] w-[72px] rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
          style={{
            border: "2px solid rgba(6,182,212,0.4)",
            background: "#1a1a1a",
          }}
        >
          {data.profile_image ? (
            <img
              src={data.profile_image}
              alt={data.first_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserIconPlaceholder size={40} color="#06b6d4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            style={{
              color: "#06b6d4",
              fontSize: 10,
              letterSpacing: 2,
              fontWeight: 700,
            }}
          >
            IDENTITY CARD
          </p>
          <p className="text-white font-bold text-lg leading-tight mt-0.5 truncate">
            {data.first_name} {data.last_name ?? ""}
          </p>
          <div
            className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5"
            style={{
              background: "rgba(6,182,212,0.15)",
              border: "1px solid rgba(6,182,212,0.3)",
            }}
          >
            <GraduationCap size={11} color="#06b6d4" />
            <span style={{ color: "#06b6d4", fontSize: 11, fontWeight: 600 }}>
              {data.class_name ?? "—"} · {data.section_name ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
        <ModernInfoCell label="Roll No." value={data.roll_number ?? "—"} />
        <ModernInfoCell
          label="Blood Group"
          value={formatBloodGroup(data.blood_group)}
          accent
        />
        <ModernInfoCell label="Contact" value={data.phone_number ?? "—"} />
        <ModernInfoCell label="Adm. No." value={data.admission_number ?? "—"} />
        <div className="col-span-2">
          <ModernInfoCell label="Address" value={formatAddress(data)} />
        </div>
      </div>

      {/* School footer */}
      <div
        style={{
          background: "#1a1a1a",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
        className="px-5 py-3 flex items-center gap-2"
      >
        {data.school_logo ? (
          <img
            src={data.school_logo}
            alt=""
            className="h-5 w-5 object-contain opacity-70 shrink-0"
          />
        ) : (
          <School size={14} color="#06b6d4" />
        )}
        <p
          style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}
          className="truncate"
        >
          {data.school_name ?? "School Name"}
        </p>
        <p
          style={{
            color: "rgba(255,255,255,0.2)",
            fontSize: 11,
            marginLeft: "auto",
          }}
        >
          #{data.system_number}
        </p>
      </div>
    </div>
  );
}

function ModernPickupCard({ data }: { data: PickupCardData }) {
  const pickupParents = data.parents.filter((p) => p.can_pickup);

  return (
    <div
      className="relative w-[340px] rounded-2xl overflow-hidden shadow-2xl select-none"
      style={{ background: "#0d0d0d", fontFamily: "system-ui, sans-serif" }}
    >
      <div
        style={{
          background: "linear-gradient(90deg, #10b981, #059669)",
          height: 6,
        }}
      />

      <div
        className="px-5 pt-5 pb-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, transparent 60%)",
        }}
      >
        <p
          style={{
            color: "#10b981",
            fontSize: 10,
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          PARENT PICKUP CARD
        </p>
        <p className="text-white font-bold text-lg leading-tight mt-1 truncate">
          {data.student.first_name} {data.student.last_name ?? ""}
        </p>
        <div className="flex gap-3 mt-1.5">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
            }}
          >
            <GraduationCap size={10} color="#10b981" />
            <span style={{ color: "#10b981", fontSize: 11, fontWeight: 600 }}>
              {data.student.class_name ?? "—"} ·{" "}
              {data.student.section_name ?? "—"}
            </span>
          </span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
            Roll: {data.student.roll_number ?? "—"}
          </span>
        </div>
      </div>

      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.06)",
          margin: "0 20px",
        }}
      />

      <div className="px-5 py-3 space-y-2.5">
        <p
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: 10,
            letterSpacing: 1.5,
            fontWeight: 600,
          }}
        >
          PICKUP CONTACTS
        </p>
        {pickupParents.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
            No pickup contacts assigned
          </p>
        ) : (
          pickupParents.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
                style={{
                  background: "#1a1a1a",
                  border: "1px solid rgba(16,185,129,0.3)",
                }}
              >
                {p.profile_image ? (
                  <img
                    src={p.profile_image}
                    alt={p.first_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIconPlaceholder size={28} color="#10b981" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {p.first_name} {p.last_name ?? ""}
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                  {p.relation} · {p.phone_number}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          background: "#1a1a1a",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
        className="px-5 py-3 flex items-center gap-2"
      >
        {data.student.school_logo ? (
          <img
            src={data.student.school_logo}
            alt=""
            className="h-5 w-5 object-contain opacity-70 shrink-0"
          />
        ) : (
          <School size={14} color="#10b981" />
        )}
        <p
          style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}
          className="truncate"
        >
          {data.student.school_name ?? "School Name"}
        </p>
        <p
          style={{
            color: "rgba(255,255,255,0.2)",
            fontSize: 11,
            marginLeft: "auto",
          }}
        >
          #{data.student.system_number}
        </p>
      </div>
    </div>
  );
}

// ─── TEMPLATE 3 — Minimal ─────────────────────────────────────────────────────
// Clean white card, thin border, serif-inspired type weight, single ink-blue accent

function MinimalStudentCard({ data }: { data: StudentIdCardData }) {
  return (
    <div
      className="relative w-[340px] rounded-2xl overflow-hidden shadow-lg select-none"
      style={{
        background: "#ffffff",
        border: "1.5px solid #e2e8f0",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Header strip */}
      <div
        style={{ background: "#1e40af" }}
        className="px-5 py-3 flex items-center gap-3"
      >
        {data.school_logo ? (
          <img
            src={data.school_logo}
            alt="School"
            className="h-8 w-8 rounded-lg object-contain bg-white/10 p-0.5 shrink-0"
          />
        ) : (
          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <School size={16} color="white" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-white font-bold text-sm truncate">
            {data.school_name ?? "School Name"}
          </p>
        </div>
        <span
          className="rounded px-2 py-0.5 shrink-0"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          ID CARD
        </span>
      </div>

      {/* Body */}
      <div className="px-5 pt-5 pb-3 flex gap-4">
        {/* Photo */}
        <div className="shrink-0">
          <div
            className="h-[76px] w-[76px] rounded-xl overflow-hidden flex items-center justify-center"
            style={{ background: "#f1f5f9", border: "2px solid #e2e8f0" }}
          >
            {data.profile_image ? (
              <img
                src={data.profile_image}
                alt={data.first_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIconPlaceholder size={44} color="#94a3b8" />
            )}
          </div>
          <div className="mt-1.5 text-center">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{ background: "#dbeafe", color: "#1e40af" }}
            >
              {formatBloodGroup(data.blood_group)}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p
            style={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: 16,
              lineHeight: 1.2,
            }}
            className="truncate"
          >
            {data.first_name} {data.last_name ?? ""}
          </p>
          <p
            style={{
              color: "#1e40af",
              fontWeight: 600,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {data.class_name ?? "—"} — {data.section_name ?? "—"}
          </p>

          <div className="mt-3 space-y-1.5">
            <MinimalRow label="Roll No." value={data.roll_number ?? "—"} />
            <MinimalRow label="Adm. No." value={data.admission_number ?? "—"} />
            <MinimalRow label="Contact" value={data.phone_number ?? "—"} />
          </div>
        </div>
      </div>

      {/* Address */}
      <div
        style={{
          borderTop: "1px solid #f1f5f9",
          borderBottom: "1px solid #f1f5f9",
        }}
        className="px-5 py-2"
      >
        <p style={{ color: "#64748b", fontSize: 11 }} className="truncate">
          <MapPin size={10} className="inline mr-1 opacity-60" />
          {formatAddress(data)}
        </p>
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 flex justify-between">
        <p style={{ color: "#94a3b8", fontSize: 10 }}>
          {data.school_city ?? ""}
          {data.school_phone ? ` · ${data.school_phone}` : ""}
        </p>
        <p style={{ color: "#94a3b8", fontSize: 10 }}>#{data.system_number}</p>
      </div>
    </div>
  );
}

function MinimalPickupCard({ data }: { data: PickupCardData }) {
  const pickupParents = data.parents.filter((p) => p.can_pickup);

  return (
    <div
      className="relative w-[340px] rounded-2xl overflow-hidden shadow-lg select-none"
      style={{
        background: "#ffffff",
        border: "1.5px solid #e2e8f0",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{ background: "#065f46" }}
        className="px-5 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {data.student.school_logo ? (
            <img
              src={data.student.school_logo}
              alt=""
              className="h-7 w-7 object-contain bg-white/10 rounded-lg p-0.5 shrink-0"
            />
          ) : (
            <School size={16} color="white" />
          )}
          <p className="text-white font-bold text-sm truncate">
            {data.student.school_name ?? "School Name"}
          </p>
        </div>
        <span
          className="rounded px-2 py-0.5 shrink-0"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          PICKUP
        </span>
      </div>

      <div className="px-5 py-4">
        {/* Student */}
        <div
          style={{
            background: "#f0fdf4",
            borderRadius: 12,
            padding: "10px 14px",
          }}
        >
          <p
            style={{
              color: "#065f46",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            STUDENT
          </p>
          <p
            style={{
              color: "#0f172a",
              fontWeight: 700,
              fontSize: 15,
              marginTop: 2,
            }}
          >
            {data.student.first_name} {data.student.last_name ?? ""}
          </p>
          <div className="flex gap-4 mt-1">
            <p style={{ color: "#374151", fontSize: 12 }}>
              {data.student.class_name ?? "—"} –{" "}
              {data.student.section_name ?? "—"}
            </p>
            <p style={{ color: "#374151", fontSize: 12 }}>
              Roll: {data.student.roll_number ?? "—"}
            </p>
          </div>
        </div>

        {/* Parents */}
        <div className="mt-4">
          <p
            style={{
              color: "#94a3b8",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            AUTHORISED PICKUP CONTACTS
          </p>
          {pickupParents.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 12 }}>
              No contacts assigned
            </p>
          ) : (
            pickupParents.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 py-1.5"
                style={{ borderBottom: "1px solid #f1f5f9" }}
              >
                <div
                  className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                  style={{ background: "#f1f5f9" }}
                >
                  {p.profile_image ? (
                    <img
                      src={p.profile_image}
                      alt={p.first_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIconPlaceholder size={24} color="#94a3b8" />
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    style={{ color: "#0f172a", fontWeight: 600, fontSize: 13 }}
                    className="truncate"
                  >
                    {p.first_name} {p.last_name ?? ""}
                  </p>
                  <p style={{ color: "#64748b", fontSize: 11 }}>
                    {p.relation} · {p.phone_number}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div
        style={{ borderTop: "1px solid #f1f5f9" }}
        className="px-5 py-2 flex justify-between"
      >
        <p style={{ color: "#94a3b8", fontSize: 10 }}>
          Adm: {data.student.admission_number ?? "—"}
        </p>
        <p style={{ color: "#94a3b8", fontSize: 10 }}>
          #{data.student.system_number}
        </p>
      </div>
    </div>
  );
}

// ─── Small helper sub-components ──────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  truncate,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>
          {label}:{" "}
        </span>
        <span
          className={`text-white text-xs font-medium ${truncate ? "truncate block" : ""}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function ModernInfoCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: 10,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: accent ? "#06b6d4" : "rgba(255,255,255,0.85)",
          fontSize: 13,
          fontWeight: 600,
          marginTop: 1,
        }}
        className="truncate"
      >
        {value}
      </p>
    </div>
  );
}

function MinimalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1">
      <span style={{ color: "#94a3b8", fontSize: 11, minWidth: 56 }}>
        {label}
      </span>
      <span
        style={{ color: "#1e293b", fontSize: 12, fontWeight: 500 }}
        className="truncate"
      >
        {value}
      </span>
    </div>
  );
}

// ─── Template selector button ──────────────────────────────────────────────────

function TemplateButton({
  id,
  label,
  description,
  isActive,
  onClick,
}: {
  id: string;
  label: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border px-4 py-3 transition-all"
      style={{
        borderColor: isActive ? "hsl(var(--primary))" : "hsl(var(--border))",
        background: isActive
          ? "hsl(var(--primary) / 0.06)"
          : "hsl(var(--card))",
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {isActive && (
          <span
            className="text-xs font-medium rounded-full px-2 py-0.5"
            style={{
              background: "hsl(var(--primary) / 0.12)",
              color: "hsl(var(--primary))",
            }}
          >
            Active
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </button>
  );
}

// ─── Card renderer (delegates to correct template) ────────────────────────────

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
  if (mode === "student" && idCardData) {
    if (template === "classic") return <ClassicStudentCard data={idCardData} />;
    if (template === "modern") return <ModernStudentCard data={idCardData} />;
    return <MinimalStudentCard data={idCardData} />;
  }
  if (mode === "pickup" && pickupCardData) {
    if (template === "classic")
      return <ClassicPickupCard data={pickupCardData} />;
    if (template === "modern")
      return <ModernPickupCard data={pickupCardData} />;
    return <MinimalPickupCard data={pickupCardData} />;
  }
  return null;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function GeneratePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get("studentId");
  const printRef = useRef<HTMLDivElement>(null);

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

  const { students, isLoading: isStudentsLoading } = useStudents({
    is_enabled: true,
  });

  // Auto-load if arriving from student row action
  useEffect(() => {
    if (preselectedStudentId) {
      loadCardData(preselectedStudentId);
    }
  }, [preselectedStudentId]); // eslint-disable-line

  const hasData = cardMode === "student" ? !!idCardData : !!pickupCardData;

  function handlePrint() {
    window.print();
  }

  const cardTabs = [
    {
      value: "student" as CardMode,
      label: STUDENT_PAGE.buttons.generateIdCard,
    },
    {
      value: "pickup" as CardMode,
      label: STUDENT_PAGE.buttons.generatePickupCard,
    },
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

      <Div type="col" gap="lg">
        <PageHeader
          title={STUDENT_PAGE.generate.title}
          subtitle={STUDENT_PAGE.generate.subtitle}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(STUDENT_ROUTES.list)}
            >
              <ArrowLeft size={14} />
              {STUDENT_PAGE.buttons.back}
            </Button>
          }
        />

        <Div type="row" gap="lg" align="start" className="min-h-[70vh]">
          {/* ── LEFT PANEL — Controls ──────────────────────────────────── */}
          <Div type="col" gap="md" className="w-72 shrink-0">
            {/* Step 1 — Student */}
            <Div variant="card" className="p-4">
              <Div type="row" align="center" gap="sm" className="mb-3">
                <Div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                  }}
                >
                  1
                </Div>
                <H3 color="default">Select Student</H3>
              </Div>

              {isStudentsLoading ? (
                <Div type="row" justify="center" className="py-3">
                  <Spinner size="sm" />
                </Div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                  {students.length === 0 && (
                    <P color="muted" className="text-center py-3 text-xs">
                      No students found
                    </P>
                  )}
                  {students.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => loadCardData(s.id)}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/60"
                      style={{
                        background:
                          selectedStudentId === s.id
                            ? "hsl(var(--primary) / 0.08)"
                            : "transparent",
                        border:
                          selectedStudentId === s.id
                            ? "1px solid hsl(var(--primary) / 0.3)"
                            : "1px solid transparent",
                      }}
                    >
                      <div className="h-7 w-7 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                        {s.profile_image ? (
                          <img
                            src={s.profile_image}
                            alt={s.first_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-muted-foreground">
                            {s.first_name[0]}
                            {s.last_name?.[0] ?? ""}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {s.first_name} {s.last_name ?? ""}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {s.class_name ?? "—"}{" "}
                          {s.section_name ? `· ${s.section_name}` : ""}{" "}
                          {s.roll_number ? `· Roll ${s.roll_number}` : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Div>

            {/* Step 2 — Card Type */}
            <Div variant="card" className="p-4">
              <Div type="row" align="center" gap="sm" className="mb-3">
                <Div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                  }}
                >
                  2
                </Div>
                <H3 color="default">Card Type</H3>
              </Div>
              <Div type="col" gap="sm">
                {cardTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setCardMode(tab.value)}
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors"
                    style={{
                      background:
                        cardMode === tab.value
                          ? "hsl(var(--primary) / 0.08)"
                          : "hsl(var(--muted) / 0.4)",
                      border:
                        cardMode === tab.value
                          ? "1px solid hsl(var(--primary) / 0.3)"
                          : "1px solid transparent",
                    }}
                  >
                    {tab.value === "student" ? (
                      <CreditCard
                        size={14}
                        className={
                          cardMode === tab.value
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      />
                    ) : (
                      <Users
                        size={14}
                        className={
                          cardMode === tab.value
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      />
                    )}
                    <span
                      className={`text-sm font-medium ${cardMode === tab.value ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {tab.label}
                    </span>
                  </button>
                ))}
              </Div>
            </Div>

            {/* Step 3 — Template */}
            <Div variant="card" className="p-4">
              <Div type="row" align="center" gap="sm" className="mb-3">
                <Div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                  }}
                >
                  3
                </Div>
                <H3 color="default">{STUDENT_PAGE.generate.chooseTemplate}</H3>
              </Div>
              <Div type="col" gap="sm">
                {CARD_TEMPLATES.map((t) => (
                  <TemplateButton
                    key={t.id}
                    id={t.id}
                    label={t.label}
                    description={t.description}
                    isActive={selectedTemplate === t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                  />
                ))}
              </Div>
            </Div>

            {/* Actions */}
            {hasData && (
              <Div type="col" gap="sm">
                <Button onClick={handlePrint} fullWidth>
                  <Printer size={15} />
                  {STUDENT_PAGE.buttons.printCard}
                </Button>
                <Button variant="outline" onClick={handlePrint} fullWidth>
                  <Download size={15} />
                  {STUDENT_PAGE.buttons.downloadCard}
                </Button>
              </Div>
            )}
          </Div>

          {/* ── RIGHT PANEL — Preview ──────────────────────────────────── */}
          <Div
            type="col"
            align="center"
            justify="center"
            className="flex-1 min-h-[500px] rounded-2xl"
            style={{
              background: "hsl(var(--muted) / 0.3)",
              border: "1px dashed hsl(var(--border))",
            }}
          >
            {isCardLoading ? (
              <Div type="col" align="center" gap="md">
                <Spinner size="lg" />
                <P color="muted">Loading card data…</P>
              </Div>
            ) : !selectedStudentId ? (
              <Div
                type="col"
                align="center"
                gap="md"
                className="px-8 text-center"
              >
                <Div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "hsl(var(--muted))" }}
                >
                  <CreditCard size={28} className="text-muted-foreground" />
                </Div>
                <P color="muted">{STUDENT_PAGE.generate.noStudent}</P>
              </Div>
            ) : (
              <Div type="col" align="center" gap="xl">
                {/* Live preview label */}
                <Div type="row" align="center" gap="sm">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      background: "hsl(var(--primary) / 0.1)",
                      color: "hsl(var(--primary))",
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Live Preview
                  </span>
                  <P color="muted" className="text-xs">
                    {
                      CARD_TEMPLATES.find((t) => t.id === selectedTemplate)
                        ?.label
                    }{" "}
                    template
                  </P>
                </Div>

                {/* Card preview */}
                <div id="card-print-area" ref={printRef}>
                  <CardPreview
                    template={selectedTemplate}
                    mode={cardMode}
                    idCardData={idCardData}
                    pickupCardData={pickupCardData}
                  />
                </div>

                {/* All-template thumbnail strip */}
                <Div type="col" align="center" gap="sm">
                  <P color="muted" className="text-xs">
                    All templates preview
                  </P>
                  <Div type="row" gap="md" className="overflow-x-auto pb-1">
                    {CARD_TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTemplate(t.id)}
                        className="shrink-0 group"
                      >
                        <div
                          className="rounded-xl overflow-hidden transition-all group-hover:scale-105"
                          style={{
                            transform: "scale(0.42)",
                            transformOrigin: "top center",
                            width: 340,
                            marginBottom: -196,
                            outline:
                              selectedTemplate === t.id
                                ? "2.5px solid hsl(var(--primary))"
                                : "2px solid transparent",
                            borderRadius: 16,
                          }}
                        >
                          <CardPreview
                            template={t.id}
                            mode={cardMode}
                            idCardData={idCardData}
                            pickupCardData={pickupCardData}
                          />
                        </div>
                        <p
                          className="text-xs font-medium mt-1"
                          style={{
                            color:
                              selectedTemplate === t.id
                                ? "hsl(var(--primary))"
                                : "hsl(var(--muted-foreground))",
                          }}
                        >
                          {t.label}
                        </p>
                      </button>
                    ))}
                  </Div>
                </Div>
              </Div>
            )}
          </Div>
        </Div>
      </Div>
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
