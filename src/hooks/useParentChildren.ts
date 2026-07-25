'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROUTES } from '@/constants';
import { AuthContext } from '@/types';
import { AuthService } from '@/services/auth.service';
import { ParentPortalService } from '@/services/parent-portal.service';
import { useAuthStore } from '@/store/auth.store';
import { useParentStore } from '@/store/parent.store';

export function useParentChildren() {
  const router = useRouter();
  const { user, context, setAuth, setPermissions } = useAuthStore();
  const { children, activeStudentId, setChildren, setActiveStudentId } = useParentStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const refresh = useCallback(async () => {
    if (context !== AuthContext.PARENT) return;
    setIsLoading(true);
    try {
      const list = await ParentPortalService.getChildren();
      setChildren(list);
      const current = list.find((c) => c.is_current) ?? list[0];
      if (current) setActiveStudentId(current.student_id);
    } catch {
      toast.error('Failed to load linked children');
    } finally {
      setIsLoading(false);
    }
  }, [context, setChildren, setActiveStudentId]);

  useEffect(() => {
    if (context === AuthContext.PARENT && children.length === 0) {
      void refresh();
    }
  }, [context, children.length, refresh]);

  async function switchTo(studentId: string) {
    if (studentId === activeStudentId) return;
    setIsSwitching(true);
    try {
      const result = await AuthService.switchStudent(studentId);
      if ('must_change_password' in result) {
        router.replace(`${ROUTES.changePassword}?token=${result.change_token}&ctx=parent`);
        return;
      }
      const profile = await AuthService.getMe();
      setAuth(profile, AuthContext.PARENT);
      setPermissions(profile.permissions ?? []);
      setActiveStudentId(studentId);
      await refresh();
      router.replace(ROUTES.parentPortal);
      router.refresh();
    } catch {
      toast.error('Failed to switch student');
    } finally {
      setIsSwitching(false);
    }
  }

  return {
    user,
    children,
    activeStudentId,
    activeChild: children.find((c) => c.student_id === activeStudentId) ?? null,
    hasMultipleChildren: children.length > 1,
    isLoading,
    isSwitching,
    switchTo,
    refresh,
  };
}
