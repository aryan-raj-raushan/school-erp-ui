'use client';

import { use, Suspense } from 'react';
import { ArrowLeft, Pencil, X, User, Camera } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useStaffDetail } from '@/hooks/useStaffDetail';
import { BLOOD_GROUP_LABEL, GENDER_LABEL, BLOOD_GROUPS } from '@/constants';
import {
  Div, H1, H2, P, Button, Input, Select, Textarea, FormField,
  Badge, Spinner,
} from '@/components/ui';

function StaffDetailContent({ id }: { id: string }) {
  const resolvedId = id === 'create-new' ? undefined : id;

  const {
    staff, isNew, isEditing, setIsEditing,
    form, isLoadingData,
    profileImageUrl, isUploadingImage, imageInputRef, onImageChange,
    departments, systemRoles, staffMembers,
    fullName, departmentName, reportingToName,
    isSubmitting, handleSubmit, handleBack, handleCancelEdit,
  } = useStaffDetail(resolvedId);

  if (isLoadingData) {
    return (
      <Div type="row" justify="center" align="center" className="py-32">
        <Spinner size="lg" />
      </Div>
    );
  }

  return (
    <Div type="col" gap="lg" className="max-w-4xl">
      {/* Header */}
      <Div type="row" align="center" gap="md">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft size={16} /> Back
        </Button>
        <Div type="col" gap="xs" className="flex-1">
          <H1>{isNew ? 'Add Employee' : fullName}</H1>
          {!isNew && staff?.employee_code && (
            <P color="muted" className="text-sm">Employee Code: {staff?.employee_code}</P>
          )}
        </Div>
        {!isNew && (
          <Div type="row" gap="sm">
            {isEditing ? (
              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                <X size={14} /> Cancel
              </Button>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Pencil size={14} /> Edit
              </Button>
            )}
          </Div>
        )}
      </Div>

      {/* View mode */}
      {!isEditing && !isNew && staff && (
        <Div type="col" gap="lg">
          {/* Avatar + basic info */}
          <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-5">
            <Div type="row" gap="lg" align="center">
              <Div className="relative">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={fullName} className="w-20 h-20 rounded-full object-cover border border-border" />
                ) : (
                  <Div type="row" justify="center" align="center" className="w-20 h-20 rounded-full bg-muted border border-border">
                    <User size={32} className="text-muted-foreground" />
                  </Div>
                )}
              </Div>
              <Div type="col" gap="xs">
                <H2>{fullName}</H2>
                <Badge variant="info">{staff?.role ? (systemRoles.find((r) => r.name.toUpperCase().replace(/ /g, '_') === staff.role)?.name ?? staff.role) : ''}</Badge>
                <Badge variant={staff?.is_active ? 'success' : 'default'}>
                  {staff?.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Div>
            </Div>
          </Div>

          {/* Personal info */}
          <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-5">
            <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Personal Information</H2>
            <Div type="grid" cols={2} className="gap-x-8 gap-y-3">
              <InfoRow label="Email" value={staff?.email} />
              <InfoRow label="Phone" value={staff?.phone_number ? `${staff?.dial_code ?? ''} ${staff?.phone_number}`.trim() : undefined} />
              <InfoRow label="Gender" value={staff?.gender ? (GENDER_LABEL[staff.gender] ?? staff.gender) : undefined} />
              <InfoRow label="Date of Birth" value={formatDate(staff?.date_of_birth)} />
              <InfoRow label="Blood Group" value={staff?.blood_group ? (BLOOD_GROUP_LABEL[staff.blood_group] ?? staff.blood_group) : undefined} />
              <InfoRow label="City" value={staff?.city} />
              <InfoRow label="Father's Name" value={staff?.father_name} />
              <InfoRow label="Husband's Name" value={staff?.husband_name} />
              <InfoRow label="RFID Card" value={staff?.rfid_card_number} />
              <InfoRow label="Qualification" value={staff?.qualification} />
            </Div>
            {staff?.address && (
              <Div className="mt-2">
                <InfoRow label="Address" value={staff?.address} />
              </Div>
            )}
            {staff?.permanent_address && (
              <Div className="mt-1">
                <InfoRow label="Permanent Address" value={staff?.permanent_address} />
              </Div>
            )}
          </Div>

          {/* Employment info */}
          <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-5">
            <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Employment</H2>
            <Div type="grid" cols={2} className="gap-x-8 gap-y-3">
              <InfoRow label="Role" value={staff?.role ? (systemRoles.find((r) => r.name.toUpperCase().replace(/ /g, '_') === staff.role)?.name ?? staff.role) : undefined} />
              <InfoRow label="Department" value={departmentName} />
              <InfoRow label="Employee Code" value={staff?.employee_code} />
              <InfoRow label="Joining Date" value={formatDate(staff?.joining_date)} />
              <InfoRow label="Reporting To" value={reportingToName} />
            </Div>
          </Div>

          {/* Work experience */}
          {(staff?.previous_employer || staff?.previous_role || staff?.total_experience) && (
            <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-5">
              <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Work Experience</H2>
              <Div type="grid" cols={2} className="gap-x-8 gap-y-3">
                <InfoRow label="Previous Employer" value={staff?.previous_employer} />
                <InfoRow label="Previous Role" value={staff?.previous_role} />
                <InfoRow label="Total Experience" value={staff?.total_experience} />
              </Div>
            </Div>
          )}
        </Div>
      )}

      {/* Create / Edit form */}
      {(isEditing || isNew) && (
        <form onSubmit={handleSubmit}>
          <Div type="col" gap="lg">
            {/* Avatar upload */}
            <Div type="col" gap="sm" className="rounded-xl border border-border bg-card p-5">
              <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Profile Photo</H2>
              <Div type="row" align="center" gap="lg">
                <Div className="relative">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border border-border" />
                  ) : (
                    <Div type="row" justify="center" align="center" className="w-20 h-20 rounded-full bg-muted border border-border">
                      <User size={32} className="text-muted-foreground" />
                    </Div>
                  )}
                  {isUploadingImage && (
                    <Div type="row" justify="center" align="center" className="absolute inset-0 rounded-full bg-black/40">
                      <Spinner size="sm" />
                    </Div>
                  )}
                </Div>
                <Div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={onImageChange}
                    id="profile-image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploadingImage}
                  >
                    <Camera size={14} /> {profileImageUrl ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  <P color="muted" className="text-xs mt-1">JPG, PNG or WebP — max 10 MB</P>
                </Div>
              </Div>
            </Div>

            {/* Personal information */}
            <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
              <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Personal Information</H2>

              <Div type="grid" cols={2} gap="md">
                <FormField label="First Name *" error={form.formState.errors.first_name?.message}>
                  <Input placeholder="Enter first name" {...form.register('first_name')} />
                </FormField>
                <FormField label="Last Name">
                  <Input placeholder="Enter last name" {...form.register('last_name')} />
                </FormField>
              </Div>

              <Div type="grid" cols={2} gap="md">
                <FormField label="Dial Code *" error={form.formState.errors.dial_code?.message}>
                  <Input placeholder="+91" {...form.register('dial_code')} />
                </FormField>
                <FormField label="Phone *" error={form.formState.errors.phone_number?.message}>
                  <Input type="tel" placeholder="Enter phone" {...form.register('phone_number')} />
                </FormField>
              </Div>

              <FormField label="Email" error={form.formState.errors.email?.message}>
                <Input type="email" placeholder="Enter email" {...form.register('email')} />
              </FormField>

              <Div type="grid" cols={2} gap="md">
                <FormField label="Gender">
                  <Select {...form.register('gender')}>
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </FormField>
                <FormField label="Date of Birth">
                  <Input type="date" {...form.register('date_of_birth')} />
                </FormField>
              </Div>

              <Div type="grid" cols={2} gap="md">
                <FormField label="Blood Group">
                  <Select {...form.register('blood_group')}>
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map((bg) => <option key={bg.value} value={bg.value}>{bg.label}</option>)}
                  </Select>
                </FormField>
                <FormField label="City">
                  <Input placeholder="Enter city" {...form.register('city')} />
                </FormField>
              </Div>

              <Div type="grid" cols={2} gap="md">
                <FormField label="Father's Name">
                  <Input placeholder="Enter father's name" {...form.register('father_name')} />
                </FormField>
                <FormField label="Husband's Name">
                  <Input placeholder="Enter husband's name" {...form.register('husband_name')} />
                </FormField>
              </Div>

              <FormField label="Address">
                <Textarea placeholder="Enter current address" {...form.register('address')} />
              </FormField>

              <FormField label="Permanent Address">
                <Textarea placeholder="Enter permanent address" {...form.register('permanent_address')} />
              </FormField>
            </Div>

            {/* Employment information */}
            <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
              <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Employment</H2>

              <Div type="grid" cols={2} gap="md">
                <FormField label="Role *" error={form.formState.errors.role?.message}>
                  <Select {...form.register('role')}>
                    <option value="">Select role</option>
                    {systemRoles.map((r) => (
                      <option key={r.id} value={r.name.toUpperCase().replace(/ /g, '_')}>{r.name}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Department">
                  <Select {...form.register('department_id')}>
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </Select>
                </FormField>
              </Div>

              <Div type="grid" cols={2} gap="md">
                <FormField label="Reporting To">
                  <Select {...form.register('reporting_to_id')}>
                    <option value="">Select manager</option>
                    {staffMembers
                      .filter((s) => s.id !== (resolvedId ?? ''))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} {s.last_name ?? ''}
                        </option>
                      ))}
                  </Select>
                </FormField>
                <FormField label="Joining Date">
                  <Input type="date" {...form.register('joining_date')} />
                </FormField>
              </Div>

              <Div type="grid" cols={2} gap="md">
                <FormField label="Employee Code">
                  <Input placeholder="EMP-001" {...form.register('employee_code')} />
                </FormField>
                <FormField label="Qualification">
                  <Input placeholder="M.Ed, B.Sc, etc." {...form.register('qualification')} />
                </FormField>
              </Div>

              <Div type="grid" cols={2} gap="md">
                <FormField label="RFID Card Number" hint="Managed from RFID Setup page">
                  <Input readOnly {...form.register('rfid_card_number')} className="bg-muted cursor-not-allowed" />
                </FormField>
              </Div>
            </Div>

            {/* Work experience */}
            <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
              <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Work Experience</H2>
              <Div type="grid" cols={2} gap="md">
                <FormField label="Previous Employer">
                  <Input placeholder="Previous employer name" {...form.register('previous_employer')} />
                </FormField>
                <FormField label="Role at Previous Employer">
                  <Input placeholder="Previous role" {...form.register('previous_role')} />
                </FormField>
              </Div>
              <FormField label="Total Experience">
                <Input placeholder="e.g. 5 years" {...form.register('total_experience')} />
              </FormField>
            </Div>

            {/* Login details — only on create */}
            {isNew && (
              <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
                <H2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Login Details</H2>
                <P color="muted" className="text-xs -mt-2">Staff will log in with their email / phone number and this password.</P>
                <FormField label="Password *" error={form.formState.errors.password?.message}>
                  <Input type="password" placeholder="Min 6 characters" {...form.register('password')} />
                </FormField>
                <Div type="row" align="center" gap="sm">
                  <input
                    type="checkbox"
                    id="is_active"
                    {...form.register('is_active')}
                    defaultChecked
                    className="h-4 w-4 rounded border-border"
                  />
                  <label htmlFor="is_active" className="text-sm select-none cursor-pointer">Enabled</label>
                </Div>
              </Div>
            )}

            {/* Actions */}
            <Div type="row" justify="end" gap="sm">
              <Button variant="outline" type="button" onClick={isNew ? handleBack : handleCancelEdit}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {isNew ? 'Add Employee' : 'Save Changes'}
              </Button>
            </Div>
          </Div>
        </form>
      )}
    </Div>
  );
}

function InfoRow({ label, value }: { label: string; value?: unknown }) {
  if (value === null || value === undefined || value === '') return null;
  const display = value instanceof Date
    ? value.toLocaleDateString()
    : String(value);
  return (
    <Div type="row" gap="md" align="center">
      <P color="muted" className="w-36 shrink-0 text-sm">{label}</P>
      <P className="text-sm">{display}</P>
    </Div>
  );
}

export default function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>}>
      <StaffDetailContent id={id} />
    </Suspense>
  );
}
