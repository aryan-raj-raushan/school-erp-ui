"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AdmissionSourcesService,
  AdmissionEnquiriesService,
} from "@/services/admissions.service";
import { ClassesService } from "@/services/classes.service";
import { StaffService } from "@/services/staff.service";
import {
  admissionSourceSchema,
  admissionEnquirySchema,
  enquiryHistorySchema,
  type AdmissionSourceFormValues,
  type AdmissionEnquiryFormValues,
  type EnquiryHistoryFormValues,
} from "@/lib/validations/admissions.validation";
import type {
  AdmissionSource,
  AdmissionEnquiry,
  EnquiryHistory,
  AdmissionEnquiryFilters,
  AdmissionSourceFilters,
} from "@/types/admissions.types";
import type { PaginationMeta, Class, Staff } from "@/types";

// ─────────────────────────────────────────────
// Admission Sources
// ─────────────────────────────────────────────
export function useAdmissionSources(
  initialFilters: AdmissionSourceFilters = {},
) {
  const [sources, setSources] = useState<AdmissionSource[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] =
    useState<AdmissionSourceFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSources = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await AdmissionSourcesService.list(filters);
      setSources(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load sources",
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  async function deleteSource(id: string) {
    try {
      await AdmissionSourcesService.remove(id);
      toast.success("Source deleted");
      await fetchSources();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  function updateFilters(next: Partial<AdmissionSourceFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  return {
    sources,
    pagination,
    filters,
    isLoading,
    updateFilters,
    deleteSource,
    refetch: fetchSources,
  };
}

// Source detail hook
export function useAdmissionSourceDetail(id?: string) {
  const isNew = id === "create-new";
  const [source, setSource] = useState<AdmissionSource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew);

  const form = useForm<AdmissionSourceFormValues>({
    resolver: zodResolver(admissionSourceSchema),
    defaultValues: { is_enabled: true },
  });

  const fetchSource = useCallback(async () => {
    if (!id || isNew) return;
    setIsLoading(true);
    try {
      const data = await AdmissionSourcesService.getById(id);
      setSource(data);
      form.reset({
        name: data.name,
        start_date: data.start_date ?? "",
        end_date: data.end_date ?? "",
        is_enabled: data.is_enabled,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load source");
    } finally {
      setIsLoading(false);
    }
  }, [id, isNew, form]);

  async function submit(
    values: AdmissionSourceFormValues,
  ): Promise<AdmissionSource | null> {
    try {
      const payload = {
        ...values,
        start_date: values.start_date || undefined,
        end_date: values.end_date || undefined,
      };
      if (isNew) {
        const created = await AdmissionSourcesService.create(payload);
        toast.success(`"${created.name}" created`);
        return created;
      } else {
        const updated = await AdmissionSourcesService.update(id!, payload);
        setSource(updated);
        toast.success("Source updated");
        setIsEditing(false);
        return updated;
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
      return null;
    }
  }

  useEffect(() => {
    fetchSource();
  }, [fetchSource]);

  return {
    source,
    isLoading,
    isEditing,
    setIsEditing,
    form,
    isNew,
    handleSubmit: form.handleSubmit(submit),
    isSubmitting: form.formState.isSubmitting,
  };
}

// ─────────────────────────────────────────────
// Shared lookups (classes + teachers) for enquiry list pages
// ─────────────────────────────────────────────
export function useAdmissionLookups() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Staff[]>([]);

  useEffect(() => {
    ClassesService.list()
      .then((r) => setClasses(r.items))
      .catch(() => {});
    StaffService.list()
      .then((r) => setTeachers(r.items))
      .catch(() => {});
  }, []);

  return { classes, teachers };
}

// ─────────────────────────────────────────────
// Admission Enquiries
// ─────────────────────────────────────────────
export function useAdmissionEnquiries(
  initialFilters: AdmissionEnquiryFilters = {},
) {
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] =
    useState<AdmissionEnquiryFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await AdmissionEnquiriesService.list(filters);
      setEnquiries(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load enquiries",
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  async function deleteEnquiry(id: string) {
    try {
      await AdmissionEnquiriesService.remove(id);
      toast.success("Enquiry deleted");
      await fetchEnquiries();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  function updateFilters(next: Partial<AdmissionEnquiryFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  return {
    enquiries,
    pagination,
    filters,
    isLoading,
    updateFilters,
    deleteEnquiry,
    refetch: fetchEnquiries,
  };
}

function todayDateString(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

// Enquiry detail hook
export function useAdmissionEnquiryDetail(id?: string) {
  const router = useRouter();
  const isNew = id === "create-new";
  const [enquiry, setEnquiry] = useState<AdmissionEnquiry | null>(null);
  const [history, setHistory] = useState<EnquiryHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const form = useForm<AdmissionEnquiryFormValues>({
    resolver: zodResolver(admissionEnquirySchema),
    defaultValues: {
      dial_code: "+91",
      country: "India",
      registration_fee_required: false,
    },
  });

  const historyForm = useForm<EnquiryHistoryFormValues>({
    resolver: zodResolver(enquiryHistorySchema),
    defaultValues: {
      action: "NEXT_FOLLOW_UP_UPDATE",
      next_followup_date: todayDateString(),
    },
  });

  const isTerminal =
    enquiry?.status === "ADMISSION_CONFIRMED" || enquiry?.status === "REJECTED";

  const fetchEnquiry = useCallback(async () => {
    if (!id || isNew) return;
    setIsLoading(true);
    try {
      const [data, hist] = await Promise.all([
        AdmissionEnquiriesService.getById(id),
        AdmissionEnquiriesService.getHistory(id),
      ]);
      setEnquiry(data);
      setHistory(hist);
      form.reset({
        academic_year_id: data.academic_year_id,
        father_name: data.father_name ?? "",
        mother_name: data.mother_name ?? "",
        phone: data.phone,
        dial_code: data.dial_code,
        email: data.email ?? "",
        father_occupation: data.father_occupation ?? "",
        mother_occupation: data.mother_occupation ?? "",
        father_qualification: data.father_qualification ?? "",
        mother_qualification: data.mother_qualification ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        country: data.country ?? "",
        student_name: data.student_name,
        date_of_birth: data.date_of_birth ?? "",
        gender: data.gender ?? undefined,
        religion: data.religion ?? undefined,
        category: data.category ?? undefined,
        student_current_address: data.student_current_address ?? "",
        applying_academic_year_id: data.applying_academic_year_id,
        applying_class_id: data.applying_class_id,
        previous_school_name: data.previous_school_name ?? "",
        previous_class: data.previous_class ?? "",
        registration_fee_required: data.registration_fee_required,
        assigned_teacher_id: data.assigned_teacher_id ?? "",
        next_followup_date: data.next_followup_date ?? "",
        next_followup_time: data.next_followup_time ?? "",
        enquiry_source_id: data.enquiry_source_id ?? "",
        remarks: data.remarks,
        status: data.status,
      });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load enquiry",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, isNew, form]);

  async function submit(
    values: AdmissionEnquiryFormValues,
  ): Promise<AdmissionEnquiry | null> {
    try {
      const payload = {
        ...values,
        dial_code: values.dial_code || "+91",
        email: values.email || undefined,
        father_name: values.father_name || undefined,
        mother_name: values.mother_name || undefined,
        assigned_teacher_id: values.assigned_teacher_id || undefined,
        enquiry_source_id: values.enquiry_source_id || undefined,
        next_followup_date: values.next_followup_date || undefined,
        next_followup_time: values.next_followup_time || undefined,
        date_of_birth: values.date_of_birth || undefined,
      };
      if (isNew) {
        const created = await AdmissionEnquiriesService.create(payload);
        toast.success(`Enquiry for "${created.student_name}" created`);
        return created;
      } else {
        const updated = await AdmissionEnquiriesService.update(id!, payload);
        setEnquiry(updated);
        toast.success("Enquiry updated");
        setIsEditing(false);
        return updated;
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
      return null;
    }
  }

  async function addHistory(values: EnquiryHistoryFormValues) {
    if (!id || isNew) return;
    try {
      const payload: any = {
        action: values.action,
        details: values.details || undefined,
        remarks: values.remarks,
      };
      if (values.next_followup_date?.trim())
        payload.next_followup_date = values.next_followup_date;
      if (values.next_followup_time?.trim())
        payload.next_followup_time = values.next_followup_time;

      const entry = await AdmissionEnquiriesService.addHistory(id, payload);
      setHistory((prev) => [...prev, entry]);
      setShowHistoryModal(false);
      historyForm.reset({
        action: "NEXT_FOLLOW_UP_UPDATE",
        next_followup_date: todayDateString(),
      });

      if (values.action === "ADMISSION_CONFIRMED") {
        toast.success("Admission confirmed — let's onboard the student");
        router.push(`/students/create-new?entry_id=${id}`);
        return;
      }

      toast.success("History entry added");
      // Refresh enquiry to get updated status
      const updated = await AdmissionEnquiriesService.getById(id);
      setEnquiry(updated);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add history");
    }
  }

  useEffect(() => {
    fetchEnquiry();
  }, [fetchEnquiry]);

  return {
    enquiry,
    history,
    isLoading,
    isEditing,
    setIsEditing,
    form,
    isNew,
    isTerminal,
    handleSubmit: form.handleSubmit(submit),
    isSubmitting: form.formState.isSubmitting,
    showHistoryModal,
    openHistoryModal: () => setShowHistoryModal(true),
    closeHistoryModal: () => {
      setShowHistoryModal(false);
      historyForm.reset({
        action: "NEXT_FOLLOW_UP_UPDATE",
        next_followup_date: todayDateString(),
      });
    },
    historyForm,
    handleAddHistory: historyForm.handleSubmit(addHistory),
    isHistorySubmitting: historyForm.formState.isSubmitting,
  };
}
