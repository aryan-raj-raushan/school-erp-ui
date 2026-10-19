'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSchoolBrandStore } from '@/store/school.store';
import { SchoolProfileService } from '@/services/school-profile.service';

export function useSchoolLogo() {
  const { brand, setBrand } = useSchoolBrandStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (brand || !isAuthenticated) return;
    SchoolProfileService.get()
      .then((data) =>
        setBrand({
          name: data.name,
          logo_url: data.logo_url ?? null,
          restriction_level: data.restriction_level,
          restriction_reason: data.restriction_reason,
        }),
      )
      .catch(() => {});
  }, [brand, isAuthenticated, setBrand]);

  return brand;
}
