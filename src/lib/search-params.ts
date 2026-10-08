import { isObjectId } from "@/lib/validation";
import type { BikeListQuery, BikeType } from "@/types/api";

export type SearchParams = Record<string, string | string[] | undefined>;

export const BIKES_PER_PAGE = 12;
export const PRODUCTS_PER_PAGE = 12;

export const PRICE_SLIDER = { max: 1_000_000, step: 10_000 } as const;

export interface RangeOption {
  label: string;
  min?: number;
  max?: number;
}

export const TOP_SPEED_OPTIONS: RangeOption[] = [
  { label: "Up to 50 km/h", max: 50 },
  { label: "50 - 80 km/h", min: 50, max: 80 },
  { label: "80+ km/h", min: 80 },
];

export const RANGE_OPTIONS: RangeOption[] = [
  { label: "Up to 80 km", max: 80 },
  { label: "80 - 150 km", min: 80, max: 150 },
  { label: "150+ km", min: 150 },
];

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function nonNegative(value: string | string[] | undefined) {
  const raw = firstParam(value)?.trim();
  if (!raw) return undefined;
  const number = Number(raw);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

export function pageParam(value: string | string[] | undefined) {
  const page = Number(firstParam(value));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function orderedRange(min?: number, max?: number) {
  return min !== undefined && max !== undefined && min > max ? { min, max: undefined } : { min, max };
}

export interface BikeFilters {
  search: string;
  brands: string[];
  type?: BikeType;
  minPrice?: number;
  maxPrice?: number;
  minTopSpeed?: number;
  maxTopSpeed?: number;
  minRange?: number;
  maxRange?: number;
  page: number;
}

export function parseBikeFilters(params: SearchParams): BikeFilters {
  const type = firstParam(params.type);
  const price = orderedRange(nonNegative(params.minPrice), nonNegative(params.maxPrice));
  const speed = orderedRange(nonNegative(params.minTopSpeed), nonNegative(params.maxTopSpeed));
  const range = orderedRange(nonNegative(params.minRange), nonNegative(params.maxRange));

  return {
    search: firstParam(params.search)?.trim() ?? "",
    brands: (firstParam(params.brand) ?? "").split(",").filter(isObjectId),
    type: type === "bike" || type === "scooter" ? type : undefined,
    minPrice: price.min,
    maxPrice: price.max,
    minTopSpeed: speed.min,
    maxTopSpeed: speed.max,
    minRange: range.min,
    maxRange: range.max,
    page: pageParam(params.page),
  };
}

export function toBikeQuery(filters: BikeFilters): BikeListQuery {
  return {
    page: filters.page,
    limit: BIKES_PER_PAGE,
    search: filters.search || undefined,
    brand: filters.brands.length ? filters.brands.join(",") : undefined,
    type: filters.type,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minTopSpeed: filters.minTopSpeed,
    maxTopSpeed: filters.maxTopSpeed,
    minRange: filters.minRange,
    maxRange: filters.maxRange,
  };
}

export function hrefWith(
  pathname: string,
  params: SearchParams,
  overrides: Record<string, string | number | undefined> = {},
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const single = firstParam(value);
    if (single) query.set(key, single);
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined || value === "") query.delete(key);
    else query.set(key, String(value));
  }

  const search = query.toString();
  return search ? `${pathname}?${search}` : pathname;
}
