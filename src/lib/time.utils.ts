export function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return [h > 0 ? `${h}h` : '', m > 0 ? `${m}m` : ''].filter(Boolean).join(' ');
}

