import { EventType } from "@/types";
import {
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Bell,
} from "lucide-react";

const ICON_MAP: Record<EventType, React.ElementType> = {
  statement_close: Calendar,
  payment_due: AlertCircle,
  recommended_pay_by: Clock,
  planned_payment: CheckCircle2,
  reminder: Bell,
};

const COLOR_MAP: Record<EventType, string> = {
  statement_close: "text-amber-500",
  payment_due: "text-red-500",
  recommended_pay_by: "text-emerald-500",
  planned_payment: "text-blue-500",
  reminder: "text-slate-400",
};

interface EventIconProps {
  type: EventType;
  size?: number;
  className?: string;
  colorClass?: string; // overrides default event-type color
}

export default function EventIcon({
  type,
  size = 14,
  className = "",
  colorClass,
}: EventIconProps) {
  const Icon = ICON_MAP[type];
  const color = colorClass ?? COLOR_MAP[type];
  return (
    <Icon
      style={{ width: size, height: size }}
      className={`${color} shrink-0 ${className}`}
    />
  );
}
