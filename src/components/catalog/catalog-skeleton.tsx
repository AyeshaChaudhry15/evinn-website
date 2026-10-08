import { container } from "@/components/ui/styles";

function CardSkeleton() {
  return (
    <div className="h-88 animate-pulse overflow-hidden rounded-xl border border-line bg-ink-900">
      <div className="h-52 bg-ink-800" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded bg-ink-800" />
        <div className="h-4 w-3/4 rounded bg-ink-800" />
        <div className="h-4 w-1/2 rounded bg-ink-800" />
        <div className="h-10 w-full rounded-lg bg-ink-800" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
      aria-hidden
    >
      {Array.from({ length: count }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

export function CatalogPageSkeleton({
  withFilters = true,
}: {
  withFilters?: boolean;
}) {
  return (
    <div className={`${container} py-10 lg:py-14`} aria-busy="true">
      <span className="sr-only" role="status">
        Loading…
      </span>
      <div className="mb-10 space-y-3">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-ink-800" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-ink-800" />
      </div>
      {withFilters ? (
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="hidden h-140 animate-pulse rounded-xl border border-line bg-ink-925 lg:block" />
          <GridSkeleton />
        </div>
      ) : (
        <GridSkeleton count={8} />
      )}
    </div>
  );
}
