"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { TrendingUp, LogOut } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/cards": "Cards",
  "/monthly": "Monthly Summary",
  "/timeline": "Timeline",
};

export default function TopBar() {
  const pathname = usePathname();
  const base = "/" + (pathname.split("/")[1] || "");
  const isCardDetail = pathname.startsWith("/cards/") && pathname !== "/cards";
  const title = isCardDetail ? "Card Detail" : PAGE_TITLES[base] ?? "CreditCycle";

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
        <TrendingUp className="w-3.5 h-3.5 text-white" />
      </div>
      <h1 className="text-base font-semibold text-slate-900 flex-1">{title}</h1>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </header>
  );
}
