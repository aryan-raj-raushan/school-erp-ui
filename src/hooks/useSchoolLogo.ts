'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSchoolBrandStore } from '@/store/school.store';
import { SchoolProfileService } from '@/services/school-profile.service';
import { AuthContext } from '@/types';

export function useSchoolLogo() {
  const { brand, setBrand } = useSchoolBrandStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const context = useAuthStore((s) => s.context);

  useEffect(() => {
    if (brand || !isAuthenticated || context !== AuthContext.SCHOOL) return;
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
  }, [brand, isAuthenticated, context, setBrand]);

  return brand;
}
