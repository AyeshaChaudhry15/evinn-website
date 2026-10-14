import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { hrefWith, type SearchParams } from "@/lib/search-params";
import { cn } from "@/lib/cn";
import type { Pagination as PaginationData } from "@/types/api";

interface PaginationProps {
  pagination: PaginationData;
  pathname: string;
  searchParams: SearchParams;
}

function pageWindow(current: number, total: number): (number | null)[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  return sorted.flatMap((page, index) =>
    index > 0 && page - sorted[index - 1] > 1 ? [null, page] : [page],
  );
}

const itemClass =
  "flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors";

export function Pagination({
  pagination,
  pathname,
  searchParams,
}: PaginationProps) {
  const { page, totalPages, hasNextPage, hasPrevPage } = pagination;
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) =>
    hrefWith(pathname, searchParams, {
      page: target === 1 ? undefined : target,
    });

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {hasPrevPage ? (
        <Link
          href={hrefFor(page - 1)}
          className={cn(
            itemClass,
            "border-line text-soft hover:border-line-strong hover:text-white",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
        </Link>
      ) : (
        <span
          className={cn(itemClass, "border-line/50 text-faint/50")}
          aria-hidden
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pageWindow(page, totalPages).map((target, index) =>
        target === null ? (
          <span key={`gap-${index}`} className="px-1 text-faint">
            …
          </span>
        ) : (
          <Link
            key={target}
            href={hrefFor(target)}
            aria-current={target === page ? "page" : undefined}
            className={cn(
              itemClass,
              target === page
                ? "border-[#0057D9] bg-[#0057D9] text-ink-950"
                : "border-line text-soft hover:border-line-strong hover:text-white",
            )}
          >
            {target}
          </Link>
        ),
      )}

      {hasNextPage ? (
        <Link
          href={hrefFor(page + 1)}
          className={cn(
            itemClass,
            "border-line text-soft hover:border-line-strong hover:text-white",
          )}
        >
          <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className={cn(itemClass, "border-line/50 text-faint/50")}
          aria-hidden
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
