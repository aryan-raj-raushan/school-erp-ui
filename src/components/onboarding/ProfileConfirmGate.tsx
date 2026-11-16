"use client";

import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserRoundCheck } from "lucide-react";
import { Button, FormField, Input, ResponsiveSelect } from "@/components/ui";
import { BLOOD_GROUP_OPTIONS, GENDER_OPTIONS } from "@/constants";
import { AuthContext, Role, type UserProfile } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { AuthService, type ConfirmProfilePayload } from "@/services/auth.service";
import {
  profileConfirmSchema,
  type ProfileConfirmFormValues,
} from "@/lib/validations/profile-confirm.validation";

function needsConfirmation(user: UserProfile | null, context: AuthContext | null): boolean {
  if (!user || user.profile_confirmed_at !== null) return false;
  if (context === AuthContext.PARENT) return true;
  return context === AuthContext.SCHOOL && user.role !== Role.SCHOOL_ADMIN;
}

function toDateInput(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function toPayload(values: ProfileConfirmFormValues): ConfirmProfilePayload {
  const entries = Object.entries(values).filter(([, value]) => value !== "" && value !== undefined);
  return Object.fromEntries(entries) as unknown as ConfirmProfilePayload;
}

/** New staff and parents confirm their details once, right after their first login. */
export function ProfileConfirmGate({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const context = useAuthStore((s) => s.context);

  if (!user || !context || !needsConfirmation(user, context)) return <>{children}</>;
  return <ProfileConfirmForm user={user} context={context} />;
}

function ProfileConfirmForm({ user, context }: { user: UserProfile; context: AuthContext }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setPermissions = useAuthStore((s) => s.setPermissions);
  const isParent = context === AuthContext.PARENT;

  const form = useForm<ProfileConfirmFormValues>({
    resolver: zodResolver(profileConfirmSchema),
    defaultValues: {
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      email: user.email ?? "",
      gender: user.gender ?? "",
      date_of_birth: toDateInput(user.date_of_birth),
      blood_group: user.blood_group ?? "",
      address: user.address ?? "",
      city: user.city ?? "",
      alternate_phone: user.alternate_phone ?? "",
      occupation: user.occupation ?? "",
    },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const profile = await AuthService.confirmProfile(toPayload(values));
      setAuth(profile, context);
      if (profile.permissions) setPermissions(profile.permissions);
      toast.success("Thanks! Your details are saved.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not save your details");
    }
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 md:px-0">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UserRoundCheck size={24} />
        </span>
        <div>
          <h1 className="text-xl font-semibold">Welcome, {user.first_name}!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isParent
              ? "Please confirm your details so the school can reach you about your child."
              : "Please confirm your details before you start. Your school uses these for records and payroll."}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="First name" required error={errors.first_name?.message}>
            <Input autoCapitalize="words" {...form.register("first_name")} />
          </FormField>
          <FormField label="Last name" error={errors.last_name?.message}>
            <Input autoCapitalize="words" {...form.register("last_name")} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Mobile number" hint="This is your login. Ask the school office to change it.">
            <Input value={user.phone_number ?? ""} readOnly disabled />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <Input type="email" inputMode="email" autoCapitalize="none" {...form.register("email")} />
          </FormField>
        </div>

        {isParent ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Alternate mobile" error={errors.alternate_phone?.message}>
              <Input type="tel" inputMode="numeric" maxLength={10} {...form.register("alternate_phone")} />
            </FormField>
            <FormField label="Occupation" error={errors.occupation?.message}>
              <Input {...form.register("occupation")} />
            </FormField>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Gender">
                <ResponsiveSelect
                  {...form.register("gender")}
                  customPlaceholder="Select"
                  options={GENDER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />
              </FormField>
              <FormField label="Date of birth">
                <Input type="date" {...form.register("date_of_birth")} />
              </FormField>
              <FormField label="Blood group">
                <ResponsiveSelect
                  {...form.register("blood_group")}
                  customPlaceholder="Select"
                  options={BLOOD_GROUP_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Address" className="sm:col-span-2" error={errors.address?.message}>
                <Input {...form.register("address")} />
              </FormField>
              <FormField label="City" error={errors.city?.message}>
                <Input autoCapitalize="words" {...form.register("city")} />
              </FormField>
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting}>
            Save and continue
          </Button>
        </div>
      </form>
    </div>
  );
}
