import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "error";
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  tone = "neutral",
  className,
}: EmptyStateProps) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "flex min-h-72 flex-col items-center justify-center rounded-xl border bg-ink-900 px-6 py-12 text-center",
        tone === "error" ? "border-red-500/25" : "border-line",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-muted">
          {icon}
        </div>
      )}
      <p
        className={cn(
          "text-lg font-semibold",
          tone === "error" ? "text-red-400" : "text-fg",
        )}
      >
        {title}
      </p>
      {description && (
        <p className="mt-2 max-w-md text-sm text-faint">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
