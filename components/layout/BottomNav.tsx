"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  CalendarDays,
  GitBranch,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/monthly", label: "Monthly", icon: CalendarDays },
  { href: "/timeline", label: "Timeline", icon: GitBranch },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom">
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors
                ${active ? "text-slate-900" : "text-slate-400"}
              `}
            >
              <Icon
                className={`w-5 h-5 ${active ? "text-slate-900" : "text-slate-400"}`}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
