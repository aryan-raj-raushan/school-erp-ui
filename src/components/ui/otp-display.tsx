export function OtpDisplay({ code }: { code?: string }) {
  if (!code) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-amber-900">
      <span className="text-xs">SMS/email is not connected yet — your code is</span>
      <span className="font-mono text-lg font-bold tracking-[0.3em]">{code}</span>
    </div>
  );
}
