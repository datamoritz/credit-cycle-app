import Link from "next/link";
import { CreditCard } from "@/types";
import { formatCurrency, formatDate, daysUntil, getDaysLabel, CARD_COLOR_MAP } from "@/lib/utils";
import UtilizationBar from "@/components/ui/UtilizationBar";
import { AlertCircle, Clock } from "lucide-react";

interface ActionCardProps {
  card: CreditCard;
  reason: "high_utilization" | "close_soon" | "payment_due";
}

const REASON_META = {
  high_utilization: {
    icon: AlertCircle,
    color: "text-orange-500",
    label: (card: CreditCard) =>
      `${card.utilization.toFixed(1)}% utilization — consider paying down`,
  },
  close_soon: {
    icon: Clock,
    color: "text-amber-500",
    label: (card: CreditCard) =>
      `Statement closes ${formatDate(card.nextCloseDate)} · ${getDaysLabel(daysUntil(card.nextCloseDate))}`,
  },
  payment_due: {
    icon: AlertCircle,
    color: "text-red-500",
    label: (card: CreditCard) =>
      `Payment due ${formatDate(card.nextDueDate)} · ${getDaysLabel(daysUntil(card.nextDueDate))}`,
  },
};

export default function ActionCard({ card, reason }: ActionCardProps) {
  const colors = CARD_COLOR_MAP[card.color];
  const meta = REASON_META[reason];
  const Icon = meta.icon;

  return (
    <Link href={`/cards/${card.id}`}>
      <div className="flex items-center gap-3 p-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
        {/* Card color dot */}
        <div
          className={`w-8 h-8 rounded-lg ${colors.accent} flex items-center justify-center shrink-0`}
        >
          <span className="text-white text-xs font-bold">
            {card.issuer.slice(0, 2).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-900">{card.issuer}</p>
            <span className="text-sm font-semibold text-slate-900 tabular-nums">
              {formatCurrency(card.currentBalance)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Icon className={`w-3 h-3 ${meta.color}`} />
            <p className={`text-xs ${meta.color} font-medium`}>
              {meta.label(card)}
            </p>
          </div>
          <div className="mt-2">
            <UtilizationBar value={card.utilization} height="thin" />
          </div>
        </div>
      </div>
    </Link>
  );
}
