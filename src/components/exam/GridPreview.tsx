import { Grid3x3 } from "lucide-react";
import { P } from "@/components/ui";

export function GridPreview({ rows, cols }: { rows: number; cols: number }) {
  const r = Math.min(rows, 12);
  const c = Math.min(cols, 12);
  const capacity = rows * cols;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2">
        <Grid3x3 size={13} className="text-muted-foreground" />
        <P color="muted" className="text-xs">
          Preview — {rows} × {cols} ={" "}
          <strong className="text-foreground">{capacity} seats</strong>
          {(rows > 12 || cols > 12) && " (preview truncated)"}
        </P>
      </div>
      <div
        className="inline-grid gap-0.5 p-2 bg-muted/40 rounded-lg border border-border"
        style={{ gridTemplateColumns: `repeat(${c}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: r * c }, (_, i) => {
          const seatNum = Math.floor(i / c) * cols + (i % c) + 1;
          return (
            <div
              key={i}
              className="w-6 h-6 flex items-center justify-center rounded-sm bg-primary/10 border border-primary/20 text-[9px] font-medium text-primary/70"
            >
              {seatNum}
            </div>
          );
        })}
      </div>
    </div>
  );
}
