import { ReactNode } from "react";

interface CardShellProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function CardShell({
  children,
  className = "",
  padding = "md",
}: CardShellProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 ${PADDING[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
