export function missingFieldsMessage(
  values: object,
  labels: Record<string, string>,
): string | null {
  const record = values as Record<string, unknown>;
  const missing = Object.entries(labels)
    .filter(([key]) => {
      const value = record[key];
      return value === undefined || value === null || (typeof value === 'string' && !value.trim());
    })
    .map(([, label]) => label);
  return missing.length ? `Please fill in: ${missing.join(', ')}` : null;
}
