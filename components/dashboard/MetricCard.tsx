import { ReactNode } from "react";
import CardShell from "@/components/ui/CardShell";

interface MetricCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon?: ReactNode;
  accent?: "default" | "warning" | "danger" | "success";
}

const ACCENT_MAP = {
  default: { value: "text-slate-900", sub: "text-slate-500" },
  warning: { value: "text-amber-700", sub: "text-amber-600" },
  danger: { value: "text-red-700", sub: "text-red-500" },
  success: { value: "text-emerald-700", sub: "text-emerald-600" },
};

export default function MetricCard({
  label,
  value,
  sublabel,
  icon,
  accent = "default",
}: MetricCardProps) {
  const colors = ACCENT_MAP[accent];
  return (
    <CardShell>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {label}
          </p>
          <p className={`text-2xl font-bold tabular-nums ${colors.value}`}>
            {value}
          </p>
          {sublabel && (
            <p className={`text-xs ${colors.sub}`}>{sublabel}</p>
          )}
        </div>
        {icon && (
          <div className="text-slate-300 mt-0.5">{icon}</div>
        )}
      </div>
    </CardShell>
  );
}
