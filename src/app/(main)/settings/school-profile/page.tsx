'use client';

import { useSchoolProfile } from '@/hooks/useSchoolProfile';
import { ImageUpload } from '@/components/shared/ImageUpload';
import {
  Div,
  H3,
  Button,
  Input,
  Spinner,
  FormField,
  PageHeader,
  PageCol,
  ResponsiveSelect,
} from '@/components/ui';
import {
  SCHOOL_PROFILE_PAGE,
  BOARD_TYPE_OPTIONS,
  MARKING_SYSTEM_OPTIONS,
  TIMEZONE_OPTIONS,
} from '@/constants/school-profile.constants';

export default function SchoolProfilePage() {
  const { form, isLoading, isSaving, updateField, save, uploadLogo } = useSchoolProfile();

  if (isLoading) {
    return (
      <PageCol>
        <Div type="row" justify="center" padding="p-12">
          <Spinner />
        </Div>
      </PageCol>
    );
  }

  return (
    <PageCol>
      <PageHeader
        title={SCHOOL_PROFILE_PAGE.title}
        subtitle={SCHOOL_PROFILE_PAGE.subtitle}
        actions={
          <Button onClick={save} loading={isSaving}>
            {isSaving ? SCHOOL_PROFILE_PAGE.saving : SCHOOL_PROFILE_PAGE.save}
          </Button>
        }
      />

      <Div type="col" gap="lg">
        {/* Basic Information */}
        <Div variant="card" type="col" gap="md" padding="p-6">
          <H3>{SCHOOL_PROFILE_PAGE.sections.basic}</H3>
          <Div type="grid" cols={2} gap="md">
            <FormField label={SCHOOL_PROFILE_PAGE.fields.name}>
              <Input
                value={form.name ?? ''}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Delhi Public School"
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.code}>
              <Input
                value={form.code ?? ''}
                onChange={(e) => updateField('code', e.target.value)}
                placeholder="DPS"
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.udise_code}>
              <Input
                value={form.udise_code ?? ''}
                onChange={(e) => updateField('udise_code', e.target.value)}
                placeholder="27050101101"
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.affiliation_number}>
              <Input
                value={form.affiliation_number ?? ''}
                onChange={(e) => updateField('affiliation_number', e.target.value)}
                placeholder="530/2022"
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.established_year}>
              <Input
                type="number"
                value={form.established_year ?? ''}
                onChange={(e) => updateField('established_year', Number(e.target.value))}
                placeholder="1995"
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.timezone}>
              <ResponsiveSelect
                value={form.timezone ?? 'Asia/Kolkata'}
                onChange={(e) => updateField('timezone', e.target.value)}
                options={TIMEZONE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
              />
            </FormField>
          </Div>
        </Div>

        {/* Academic Configuration */}
        <Div variant="card" type="col" gap="md" padding="p-6">
          <H3>{SCHOOL_PROFILE_PAGE.sections.academic}</H3>
          <Div type="grid" cols={2} gap="md">
            <FormField label={SCHOOL_PROFILE_PAGE.fields.board_type}>
              <ResponsiveSelect
                value={form.board_type ?? ''}
                onChange={(e) => updateField('board_type', e.target.value)}
                customPlaceholder="Select board"
                options={BOARD_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.marking_system}>
              <ResponsiveSelect
                value={form.marking_system ?? ''}
                onChange={(e) => updateField('marking_system', e.target.value)}
                customPlaceholder="Select system"
                options={MARKING_SYSTEM_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
              />
            </FormField>
          </Div>
        </Div>

        {/* Contact Details */}
        <Div variant="card" type="col" gap="md" padding="p-6">
          <H3>{SCHOOL_PROFILE_PAGE.sections.contact}</H3>
          <Div type="grid" cols={2} gap="md">
            <FormField label={SCHOOL_PROFILE_PAGE.fields.email}>
              <Input
                type="email"
                value={form.email ?? ''}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="info@school.edu.in"
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.contact_number}>
              <Input
                value={form.contact_number ?? ''}
                onChange={(e) => updateField('contact_number', e.target.value)}
                placeholder="9876543210"
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.website}>
              <Input
                value={form.website ?? ''}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://school.edu.in"
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.logo_url}>
              <ImageUpload
                currentUrl={form.logo_url}
                onUpload={uploadLogo}
                shape="square"
                size={88}
                label="Click to upload (JPG, PNG, WebP)"
              />
            </FormField>
          </Div>
        </Div>

        {/* Location */}
        <Div variant="card" type="col" gap="md" padding="p-6">
          <H3>{SCHOOL_PROFILE_PAGE.sections.location}</H3>
          <Div type="grid" cols={2} gap="md">
            <FormField label={SCHOOL_PROFILE_PAGE.fields.address}>
              <Input
                value={form.address ?? ''}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="123, MG Road"
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.city}>
              <Input
                value={form.city ?? ''}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="New Delhi"
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.state}>
              <Input
                value={form.state ?? ''}
                onChange={(e) => updateField('state', e.target.value)}
                placeholder="Delhi"
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.pincode}>
              <Input
                value={form.pincode ?? ''}
                onChange={(e) => updateField('pincode', e.target.value)}
                placeholder="110001"
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.lat}>
              <Input
                type="number"
                value={form.lat ?? ''}
                onChange={(e) => updateField('lat', e.target.value)}
                placeholder="28.6139"
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.lng}>
              <Input
                type="number"
                value={form.lng ?? ''}
                onChange={(e) => updateField('lng', e.target.value)}
                placeholder="77.2090"
              />
            </FormField>
          </Div>
        </Div>

        {/* Principal Details */}
        <Div variant="card" type="col" gap="md" padding="p-6">
          <H3>{SCHOOL_PROFILE_PAGE.sections.principal}</H3>
          <Div type="grid" cols={2} gap="md">
            <FormField label={SCHOOL_PROFILE_PAGE.fields.principal_name}>
              <Input
                value={form.principal_name ?? ''}
                onChange={(e) => updateField('principal_name', e.target.value)}
                placeholder="Dr. Rajesh Kumar"
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.principal_email}>
              <Input
                type="email"
                value={form.principal_email ?? ''}
                onChange={(e) => updateField('principal_email', e.target.value)}
                placeholder="principal@school.edu.in"
              />
            </FormField>
            <FormField label={SCHOOL_PROFILE_PAGE.fields.principal_phone}>
              <Input
                value={form.principal_phone ?? ''}
                onChange={(e) => updateField('principal_phone', e.target.value)}
                placeholder="9876543210"
              />
            </FormField>
          </Div>
        </Div>

        <Div type="row" justify="end">
          <Button onClick={save} loading={isSaving}>
            {isSaving ? SCHOOL_PROFILE_PAGE.saving : SCHOOL_PROFILE_PAGE.save}
          </Button>
        </Div>
      </Div>
    </PageCol>
  );
}
