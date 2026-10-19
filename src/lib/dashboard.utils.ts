export function getGreeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function fmtNumber(n: number): string {
  return n.toLocaleString('en-IN');
}

export function fmtRupees(n: number): string {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

export function fmtShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function fmtToday(): string {
  return new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function fmtTrendLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
}

export function summariseAttendance(rows: { status: string; count: number }[]) {
  const present = rows.filter((r) => r.status === 'PRESENT').reduce((s, r) => s + Number(r.count), 0);
  const absent = rows.filter((r) => r.status === 'ABSENT').reduce((s, r) => s + Number(r.count), 0);
  const total = rows.reduce((s, r) => s + Number(r.count), 0);
  return { present, absent, total, rate: total ? Math.round((present / total) * 100) : null };
}
