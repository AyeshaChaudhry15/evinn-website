import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  error: "border-red-500/30 bg-red-500/10 text-red-300",
  success: "border-brand/30 bg-brand/10 text-brand",
  info: "border-line bg-ink-850 text-soft",
} as const;

interface AlertProps {
  tone?: keyof typeof tones;
  children: ReactNode;
  className?: string;
}

export function Alert({ tone = "info", children, className }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        tones[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
