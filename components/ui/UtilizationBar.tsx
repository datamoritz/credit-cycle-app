import { utilizationColor, utilizationTextColor, formatPercent } from "@/lib/utils";

interface UtilizationBarProps {
  value: number;
  showLabel?: boolean;
  height?: "thin" | "normal";
}

export default function UtilizationBar({
  value,
  showLabel = true,
  height = "normal",
}: UtilizationBarProps) {
  const barColor = utilizationColor(value);
  const textColor = utilizationTextColor(value);
  const h = height === "thin" ? "h-1" : "h-1.5";

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${h} bg-slate-100 rounded-full overflow-hidden`}>
        <div
          className={`${h} ${barColor} rounded-full transition-all`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${textColor} tabular-nums w-10 text-right`}>
          {formatPercent(value)}
        </span>
      )}
    </div>
  );
}
