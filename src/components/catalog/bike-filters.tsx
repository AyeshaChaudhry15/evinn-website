"use client";

import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { input, select } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { formatPKR } from "@/lib/format";
import {
  PRICE_SLIDER,
  RANGE_OPTIONS,
  TOP_SPEED_OPTIONS,
  type BikeFilters as Filters,
  type RangeOption,
} from "@/lib/search-params";
import type { BrandSummary } from "@/types/api";

interface BikeFiltersProps {
  filters: Filters;
  brands: BrandSummary[];
  showTypeFilter?: boolean;
}

type ParamOverrides = Record<string, string | undefined>;

const SEARCH_DEBOUNCE_MS = 350;

const asParam = (value: number | undefined) =>
  value === undefined ? undefined : String(value);

function toParams(
  filters: Filters,
  showTypeFilter: boolean,
): ParamOverrides {
  return {
    search: filters.search || undefined,
    brand: filters.brands.length ? filters.brands.join(",") : undefined,
    type: showTypeFilter ? filters.type : undefined,
    minPrice: asParam(filters.minPrice),
    maxPrice: asParam(filters.maxPrice),
    minTopSpeed: asParam(filters.minTopSpeed),
    maxTopSpeed: asParam(filters.maxTopSpeed),
    minRange: asParam(filters.minRange),
    maxRange: asParam(filters.maxRange),
  };
}

function optionIndex(
  options: RangeOption[],
  min?: number,
  max?: number,
) {
  return options.findIndex(
    (option) => option.min === min && option.max === max,
  );
}

const rangeThumb =
  "pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF8A00] [&::-webkit-slider-thumb]:shadow-[0_0_9px_rgba(255,138,0,0.4)] " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#FF8A00]";

export function BikeFilters({
  filters,
  brands,
  showTypeFilter = false,
}: BikeFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const priceMax = filters.maxPrice ?? PRICE_SLIDER.max;

  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [minPriceDraft, setMinPriceDraft] = useState(
    filters.minPrice ?? 0,
  );
  const [maxPriceDraft, setMaxPriceDraft] = useState(priceMax);

  const [synced, setSynced] = useState({
    search: filters.search,
    minPrice: filters.minPrice ?? 0,
    maxPrice: priceMax,
  });

  if (
    synced.search !== filters.search ||
    synced.minPrice !== (filters.minPrice ?? 0) ||
    synced.maxPrice !== priceMax
  ) {
    if (searchDraft === synced.search) {
      setSearchDraft(filters.search);
    }

    if (minPriceDraft === synced.minPrice) {
      setMinPriceDraft(filters.minPrice ?? 0);
    }

    if (maxPriceDraft === synced.maxPrice) {
      setMaxPriceDraft(priceMax);
    }

    setSynced({
      search: filters.search,
      minPrice: filters.minPrice ?? 0,
      maxPrice: priceMax,
    });
  }

  const navigate = useCallback(
    (overrides: ParamOverrides) => {
      const params = new URLSearchParams();

      for (const [key, value] of Object.entries({
        ...toParams(filters, showTypeFilter),
        ...overrides,
      })) {
        if (value) {
          params.set(key, value);
        }
      }

      const query = params.toString();

      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [filters, pathname, router, showTypeFilter],
  );

  useEffect(() => {
    const search = searchDraft.trim();

    if (search === filters.search) return;

    const timer = window.setTimeout(
      () => navigate({ search: search || undefined }),
      SEARCH_DEBOUNCE_MS,
    );

    return () => window.clearTimeout(timer);
  }, [searchDraft, filters.search, navigate]);

  useEffect(() => {
    const min =
      minPriceDraft > 0 ? minPriceDraft : undefined;

    const max =
      maxPriceDraft < PRICE_SLIDER.max
        ? maxPriceDraft
        : undefined;

    if (
      min === filters.minPrice &&
      max === filters.maxPrice
    ) {
      return;
    }

    const timer = window.setTimeout(
      () =>
        navigate({
          minPrice: asParam(min),
          maxPrice: asParam(max),
        }),
      SEARCH_DEBOUNCE_MS,
    );

    return () => window.clearTimeout(timer);
  }, [
    minPriceDraft,
    maxPriceDraft,
    filters.minPrice,
    filters.maxPrice,
    navigate,
  ]);

  const toggleBrand = (id: string) => {
    const selected = filters.brands.includes(id)
      ? filters.brands.filter((brand) => brand !== id)
      : [...filters.brands, id];

    navigate({
      brand: selected.length
        ? selected.join(",")
        : undefined,
    });
  };

  const selectRange = (
    options: RangeOption[],
    keys: [string, string],
    value: string,
  ) => {
    const option =
      value === "" ? undefined : options[Number(value)];

    navigate({
      [keys[0]]: asParam(option?.min),
      [keys[1]]: asParam(option?.max),
    });
  };

  const clearFilters = () => {
    setSearchDraft("");
    setMinPriceDraft(0);
    setMaxPriceDraft(PRICE_SLIDER.max);

    startTransition(() =>
      router.replace(pathname, {
        scroll: false,
      }),
    );
  };

  const activeCount =
    (filters.search ? 1 : 0) +
    filters.brands.length +
    (showTypeFilter && filters.type ? 1 : 0) +
    (filters.minPrice !== undefined ||
    filters.maxPrice !== undefined
      ? 1
      : 0) +
    (filters.minTopSpeed !== undefined ||
    filters.maxTopSpeed !== undefined
      ? 1
      : 0) +
    (filters.minRange !== undefined ||
    filters.maxRange !== undefined
      ? 1
      : 0);

  const speedIndex = optionIndex(
    TOP_SPEED_OPTIONS,
    filters.minTopSpeed,
    filters.maxTopSpeed,
  );

  const rangeIndex = optionIndex(
    RANGE_OPTIONS,
    filters.minRange,
    filters.maxRange,
  );

  return (
    <aside className="h-fit rounded-xl border border-line bg-ink-925/80 p-4 sm:p-5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="bike-filters"
          className="flex items-center gap-2 text-lg font-semibold text-white lg:pointer-events-none"
        >
          <SlidersHorizontal className="h-5 w-5 text-[#0057D9]" />

          Filters

          {activeCount > 0 && (
            <span className="rounded-full bg-[#0057D9] px-2 py-0.5 text-xs font-bold text-ink-950">
              {activeCount}
            </span>
          )}

          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform lg:hidden",
              open && "rotate-180",
            )}
          />
        </button>

        {isPending && (
          <span
            className="flex items-center gap-1.5 text-xs text-muted"
            role="status"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Updating
          </span>
        )}
      </div>

      <div
        id="bike-filters"
        className={cn(
          "mt-6 space-y-7",
          !open && "hidden lg:block",
        )}
      >
        <div>
          <label
            htmlFor="bike-search"
            className="mb-2.5 block text-sm font-semibold text-soft"
          >
            Search
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />

            <input
              id="bike-search"
              type="search"
              value={searchDraft}
              onChange={(event) =>
                setSearchDraft(event.target.value)
              }
              placeholder="Model name"
              className={cn(input, "pl-10")}
            />
          </div>
        </div>

        {showTypeFilter && (
          <div>
            <label
              htmlFor="bike-type"
              className="mb-2.5 block text-sm font-semibold text-soft"
            >
              Vehicle type
            </label>

            <div className="relative">
              <select
                id="bike-type"
                value={filters.type ?? ""}
                onChange={(event) =>
                  navigate({
                    type:
                      event.target.value || undefined,
                  })
                }
                className={select}
              >
                <option value="">All types</option>
                <option value="bike">Bikes</option>
                <option value="scooter">
                  Scooters
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>
          </div>
        )}

        {brands.length > 0 && (
          <fieldset>
            <legend className="mb-2.5 text-sm font-semibold text-soft">
              Brand
            </legend>

            <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
              {brands.map((brand) => (
                <label
                  key={brand._id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm text-soft transition-colors hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(
                      brand._id,
                    )}
                    onChange={() =>
                      toggleBrand(brand._id)
                    }
                    className="h-4 w-4"
                  />

                  {brand.displayName}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="mb-2.5 text-sm font-semibold text-soft">
            Price range
          </legend>

          <div className="mb-3 flex justify-between text-xs text-muted">
            <span>
              {formatPKR(minPriceDraft)}
            </span>

            <span>
              {formatPKR(maxPriceDraft)}
              {maxPriceDraft >= PRICE_SLIDER.max &&
                "+"}
            </span>
          </div>

          <div className="relative h-6">
            <div className="absolute inset-x-1 top-2 h-1.5 rounded-full bg-ink-800" />

            <div
              className="absolute top-2 left-(--from) right-(--to) h-1.5 rounded-full bg-[#FF8A00]"
              style={
                {
                  "--from": `${
                    (minPriceDraft /
                      PRICE_SLIDER.max) *
                    100
                  }%`,
                  "--to": `${
                    100 -
                    (maxPriceDraft /
                      PRICE_SLIDER.max) *
                      100
                  }%`,
                } as CSSProperties
              }
            />

            <input
              type="range"
              aria-label="Minimum price"
              aria-valuetext={formatPKR(
                minPriceDraft,
              )}
              min={0}
              max={PRICE_SLIDER.max}
              step={PRICE_SLIDER.step}
              value={minPriceDraft}
              onChange={(event) =>
                setMinPriceDraft(
                  Math.min(
                    Number(event.target.value),
                    maxPriceDraft -
                      PRICE_SLIDER.step,
                  ),
                )
              }
              className={rangeThumb}
            />

            <input
              type="range"
              aria-label="Maximum price"
              aria-valuetext={formatPKR(
                maxPriceDraft,
              )}
              min={0}
              max={PRICE_SLIDER.max}
              step={PRICE_SLIDER.step}
              value={maxPriceDraft}
              onChange={(event) =>
                setMaxPriceDraft(
                  Math.max(
                    Number(event.target.value),
                    minPriceDraft +
                      PRICE_SLIDER.step,
                  ),
                )
              }
              className={rangeThumb}
            />
          </div>
        </fieldset>

        <RangeSelect
          id="bike-speed"
          label="Top speed"
          anyLabel="Any speed"
          options={TOP_SPEED_OPTIONS}
          selectedIndex={speedIndex}
          onChange={(value) =>
            selectRange(
              TOP_SPEED_OPTIONS,
              ["minTopSpeed", "maxTopSpeed"],
              value,
            )
          }
        />

        <RangeSelect
          id="bike-range"
          label="Range per charge"
          anyLabel="Any range"
          options={RANGE_OPTIONS}
          selectedIndex={rangeIndex}
          onChange={(value) =>
            selectRange(
              RANGE_OPTIONS,
              ["minRange", "maxRange"],
              value,
            )
          }
        />

        <button
          type="button"
          onClick={clearFilters}
          disabled={activeCount === 0}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-line bg-ink-900 text-sm font-medium text-soft transition-colors hover:border-line-strong hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Clear filters
        </button>
      </div>
    </aside>
  );
}

interface RangeSelectProps {
  id: string;
  label: string;
  anyLabel: string;
  options: RangeOption[];
  selectedIndex: number;
  onChange: (value: string) => void;
}

function RangeSelect({
  id,
  label,
  anyLabel,
  options,
  selectedIndex,
  onChange,
}: RangeSelectProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2.5 block text-sm font-semibold text-soft"
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          value={
            selectedIndex === -1
              ? ""
              : String(selectedIndex)
          }
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={select}
        >
          <option value="">{anyLabel}</option>

          {options.map((option, index) => (
            <option
              key={option.label}
              value={index}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </div>
    </div>
  );
}