import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden border-border/60 bg-card/80 p-4 sm:p-5 backdrop-blur transition-all hover:border-primary/40">
      {accent && (
        <div className="absolute inset-0 -z-10 opacity-20" style={{ background: "var(--gradient-hero)" }} />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="font-mono text-xl sm:text-3xl font-semibold tracking-tight text-foreground truncate">{value}</p>
          {sub && <p className="text-[10px] sm:text-xs text-muted-foreground">{sub}</p>}
        </div>
        {icon && <div className="text-primary shrink-0 mt-0.5">{icon}</div>}
      </div>
    </Card>
  );
}
