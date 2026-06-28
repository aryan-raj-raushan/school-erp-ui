'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SchoolProfileService, type UpdateSchoolProfilePayload } from '@/services/school-profile.service';
import { SCHOOL_PROFILE_PAGE } from '@/constants/school-profile.constants';
import type { School } from '@/types';

export function useSchoolProfile() {
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<UpdateSchoolProfilePayload>({});

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await SchoolProfileService.get();
      setSchool(data);
      setForm({
        name: data.name,
        code: data.code ?? '',
        udise_code: data.udise_code ?? '',
        affiliation_number: data.affiliation_number ?? '',
        established_year: data.established_year ?? undefined,
        timezone: data.timezone ?? 'Asia/Kolkata',
        board_type: data.board_type ?? '',
        marking_system: data.marking_system ?? '',
        email: data.email ?? '',
        contact_number: data.contact_number ?? '',
        dial_code: data.dial_code ?? '+91',
        website: data.website ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        country: data.country ?? 'India',
        pincode: data.pincode ?? '',
        logo_url: data.logo_url ?? '',
        principal_name: data.principal_name ?? '',
        principal_email: data.principal_email ?? '',
        principal_phone: data.principal_phone ?? '',
      });
    } catch {
      toast.error('Failed to load school profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateField = useCallback(<K extends keyof UpdateSchoolProfilePayload>(
    key: K,
    value: UpdateSchoolProfilePayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const save = useCallback(async () => {
    setIsSaving(true);
    try {
      const updated = await SchoolProfileService.update(form);
      setSchool(updated);
      toast.success(SCHOOL_PROFILE_PAGE.saved);
    } catch {
      toast.error('Failed to update school profile');
    } finally {
      setIsSaving(false);
    }
  }, [form]);

  return {
    school,
    form,
    isLoading,
    isSaving,
    updateField,
    save,
  };
}
