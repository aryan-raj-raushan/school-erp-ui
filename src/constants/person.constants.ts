export const SALUTATIONS = ['Mr.', 'Mrs.', 'Miss', 'Ms.', 'Dr.'] as const;

export type Salutation = (typeof SALUTATIONS)[number];

export const SALUTATION_OPTIONS = SALUTATIONS.map((value) => ({ value, label: value }));

export function defaultSalutationForGender(gender?: string | null): Salutation | '' {
  if (gender === 'MALE') return 'Mr.';
  if (gender === 'FEMALE') return 'Ms.';
  return '';
}

export function defaultSalutationForRelation(relation?: string | null): Salutation | '' {
  if (relation === 'FATHER') return 'Mr.';
  if (relation === 'MOTHER') return 'Mrs.';
  return '';
}

export function formatPersonName(
  person: { salutation?: string | null; first_name?: string | null; last_name?: string | null } | null | undefined,
): string {
  if (!person) return '';
  return [person.salutation, person.first_name, person.last_name].filter(Boolean).join(' ').trim();
}
