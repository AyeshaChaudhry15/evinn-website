import { Bike as BikeIcon } from "lucide-react";
import { BikeFilters } from "@/components/catalog/bike-filters";
import { BikeGrid } from "@/components/catalog/bike-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { errorMessage } from "@/lib/api";
import { getBikes, getBrands } from "@/lib/catalog";
import {
  parseBikeFilters,
  toBikeQuery,
  type SearchParams,
} from "@/lib/search-params";
import type { BikeType, BrandSummary } from "@/types/api";

interface BikeCatalogProps {
  pathname: string;
  searchParams: SearchParams;
  type?: BikeType;
  noun?: string;
}

export async function BikeCatalog({
  pathname,
  searchParams,
  type,
  noun = "vehicles",
}: BikeCatalogProps) {
  const filters = parseBikeFilters(searchParams);
  if (type) filters.type = type;

  const [brandsResult, bikesResult] = await Promise.allSettled([
    getBrands(),
    getBikes(toBikeQuery(filters)),
  ]);

  const brands: BrandSummary[] =
    brandsResult.status === "fulfilled" ? brandsResult.value : [];

  return (
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
      <BikeFilters filters={filters} brands={brands} showTypeFilter={!type} />

      <section aria-label={`${noun} results`} className="min-w-0">
        {bikesResult.status === "rejected" ? (
          <EmptyState
            tone="error"
            title={`We couldn't load ${noun}`}
            description={errorMessage(bikesResult.reason)}
          />
        ) : bikesResult.value.bikes.length === 0 ? (
          <EmptyState
            icon={<BikeIcon className="h-7 w-7" />}
            title={`No ${noun} found`}
            description="Try adjusting or clearing your filters."
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted">
              Showing {bikesResult.value.bikes.length} of{" "}
              {bikesResult.value.pagination.total} {noun}
            </p>
            <BikeGrid bikes={bikesResult.value.bikes} />
            <Pagination
              pagination={bikesResult.value.pagination}
              pathname={pathname}
              searchParams={searchParams}
            />
          </>
        )}
      </section>
    </div>
  );
}
