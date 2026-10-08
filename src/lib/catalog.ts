// Catalogue reads (public GET endpoints) used by Server Components.
// Responses are cached by Next.js and refreshed in the background, so pages stay fast
// while picking up catalogue changes from the admin panel within a minute.

import { ApiError, apiRequest } from "@/lib/api";
import { isObjectId } from "@/lib/validation";
import type {
  Accessory,
  AccessoryListResponse,
  AccessoryResponse,
  Bike,
  BikeListQuery,
  BikeListResponse,
  BikeResponse,
  Brand,
  BrandListResponse,
  BrandResponse,
  SparePart,
  SparePartListResponse,
  SparePartResponse,
  StockListQuery,
} from "@/types/api";

const REVALIDATE_SECONDS = 60;
const MAX_PAGE_SIZE = 100;

function cached(tag: string) {
  return { revalidate: REVALIDATE_SECONDS, tags: [tag] };
}

/** Resolves to `null` instead of throwing when the record doesn't exist (404) or the key is malformed (400). */
async function findOne<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

// ---------- Brands ----------

export async function getBrands(): Promise<Brand[]> {
  const data = await apiRequest<BrandListResponse>("/brands", { next: cached("brands") });
  return data.brands;
}

export async function getBrand(id: string): Promise<Brand | null> {
  if (!isObjectId(id)) return null;

  const data = await findOne(
    apiRequest<BrandResponse>(`/brands/${id}`, { next: cached("brands") }),
  );
  return data?.brand ?? null;
}

// ---------- Bikes ----------

export async function getBikes(query: BikeListQuery = {}): Promise<BikeListResponse> {
  return apiRequest<BikeListResponse>("/bikes", {
    query: { ...query },
    next: cached("bikes"),
  });
}

/** Every bike matching the filters, following pagination (used by pickers such as Compare). */
export async function getAllBikes(
  query: Omit<BikeListQuery, "page" | "limit"> = {},
): Promise<Bike[]> {
  const bikes: Bike[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const data = await getBikes({ ...query, page, limit: MAX_PAGE_SIZE });
    bikes.push(...data.bikes);
    hasNextPage = data.pagination.hasNextPage;
    page += 1;
  }

  return bikes;
}

export async function getBike(slug: string): Promise<Bike | null> {
  const data = await findOne(
    apiRequest<BikeResponse>(`/bikes/${encodeURIComponent(slug)}`, { next: cached("bikes") }),
  );
  return data?.bike ?? null;
}

// ---------- Accessories ----------

export async function getAccessories(query: StockListQuery = {}) {
  const data = await apiRequest<AccessoryListResponse>("/accessories", {
    query: { ...query },
    next: cached("accessories"),
  });
  return { items: data.accessories, pagination: data.pagination };
}

export async function getAccessory(slug: string): Promise<Accessory | null> {
  const data = await findOne(
    apiRequest<AccessoryResponse>(`/accessories/${encodeURIComponent(slug)}`, {
      next: cached("accessories"),
    }),
  );
  return data?.accessory ?? null;
}

// ---------- Spare parts ----------

export async function getSpareParts(query: StockListQuery = {}) {
  const data = await apiRequest<SparePartListResponse>("/spare-parts", {
    query: { ...query },
    next: cached("spare-parts"),
  });
  return { items: data.spareParts, pagination: data.pagination };
}

export async function getSparePart(slug: string): Promise<SparePart | null> {
  const data = await findOne(
    apiRequest<SparePartResponse>(`/spare-parts/${encodeURIComponent(slug)}`, {
      next: cached("spare-parts"),
    }),
  );
  return data?.sparePart ?? null;
}
