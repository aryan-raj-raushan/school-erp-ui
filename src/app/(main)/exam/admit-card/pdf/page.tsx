"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdmitCardService } from "@/services/exam.service";
import type { AdmitCardData } from "@/types/exam.types";

function PrintContent() {
  const params = useSearchParams();
  const studentId = params.get("student_id") ?? "";
  const examId = params.get("exam_id") ?? "";
  const academicYearId = params.get("academic_year_id") ?? "";

  const [data, setData] = useState<AdmitCardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId || !examId || !academicYearId) {
      setError("Missing parameters.");
      return;
    }
    AdmitCardService.getData({ student_id: studentId, exam_id: examId, academic_year_id: academicYearId })
      .then((d) => {
        setData(d);
        // give DOM time to render before printing
        setTimeout(() => window.print(), 400);
      })
      .catch((e) => setError(e?.message ?? "Failed to load admit card."));
  }, [studentId, examId, academicYearId]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">Preparing admit card…</p>
      </div>
    );
  }

  return (
    <div className="admit-card-print p-8 max-w-2xl mx-auto font-sans text-sm text-gray-900">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
        <h1 className="text-xl font-bold uppercase">{data.school.name}</h1>
        <p className="text-base font-semibold mt-1">Admit Card</p>
        <p className="text-gray-600">{data.exam.name} &nbsp;|&nbsp; {data.exam.term}</p>
        <p className="text-gray-600 text-xs">{data.exam.startDate} – {data.exam.endDate}</p>
      </div>

      {/* Student details */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 mb-5 border border-gray-300 rounded p-4">
        {([
          ["Student", data.student.name],
          ["Admission No.", data.student.admissionNumber],
          ["Roll No.", data.student.rollNumber ?? "—"],
          ["Class", data.student.className],
          ["Section", data.student.sectionName ?? "—"],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <span className="text-gray-500 shrink-0 w-28">{label}:</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>

      {/* Timetable */}
      <h2 className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-2">Exam Timetable</h2>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100">
            {["Subject", "Date", "Time", "Max Marks", "Pass Marks"].map((h) => (
              <th key={h} className="border border-gray-300 px-3 py-1.5 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.schedules.map((s, i) => (
            <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50"}>
              <td className="border border-gray-300 px-3 py-1.5 font-medium">{s.subjectName}</td>
              <td className="border border-gray-300 px-3 py-1.5">{s.examDate}</td>
              <td className="border border-gray-300 px-3 py-1.5">{s.startTime} – {s.endTime}</td>
              <td className="border border-gray-300 px-3 py-1.5">{s.examMarks}</td>
              <td className="border border-gray-300 px-3 py-1.5">{s.passingMarks ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signatures */}
      <div className="flex justify-between mt-12 pt-4 border-t border-gray-300">
        <div className="text-center">
          <div className="w-36 border-b border-gray-400 mb-1" />
          <p className="text-xs text-gray-500">Principal's Signature</p>
        </div>
        <div className="text-center">
          <div className="w-36 border-b border-gray-400 mb-1" />
          <p className="text-xs text-gray-500">Student's Signature</p>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; }
          .admit-card-print { padding: 1.5cm; max-width: 100%; }
          @page { size: A4; margin: 1cm; }
        }
      `}</style>
    </div>
  );
}

export default function AdmitCardPdfPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    }>
      <PrintContent />
    </Suspense>
  );
}
