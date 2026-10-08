"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ImageOff, Loader2, Search, X } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatPKR } from "@/lib/format";
import type {
  AccessoryListResponse,
  BikeListResponse,
  SparePartListResponse,
} from "@/types/api";

interface SearchResult {
  id: string;
  name: string;
  href: string;
  imageUrl: string;
  priceText: string;
  category: string;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const MAX_PER_GROUP = 5;

async function loadExtras(): Promise<SearchResult[]> {
  const [accessories, spareParts] = await Promise.allSettled([
    apiRequest<AccessoryListResponse>("/accessories", {
      query: { limit: 100 },
    }),
    apiRequest<SparePartListResponse>("/spare-parts", {
      query: { limit: 100 },
    }),
  ]);

  return [
    ...(accessories.status === "fulfilled"
      ? accessories.value.accessories
      : []
    ).map((item) => ({
      id: `accessory-${item._id}`,
      name: item.name,
      href: `/accessories/${item.slug}`,
      imageUrl: item.imageUrl,
      priceText: item.priceText,
      category: "Accessory",
    })),
    ...(spareParts.status === "fulfilled"
      ? spareParts.value.spareParts
      : []
    ).map((item) => ({
      id: `spare-${item._id}`,
      name: item.name,
      href: `/spare-parts/${item.slug}`,
      imageUrl: item.imageUrl,
      priceText: item.priceText,
      category: "Spare part",
    })),
  ];
}

export function NavSearch() {
  const router = useRouter();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const extrasRequested = useRef(false);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bikeResults, setBikeResults] = useState<{
    query: string;
    items: SearchResult[];
  }>({
    query: "",
    items: [],
  });
  const [extras, setExtras] = useState<SearchResult[]>([]);

  const trimmed = query.trim();
  const searching = trimmed.length >= MIN_QUERY_LENGTH;
  const bikesLoading = searching && bikeResults.query !== trimmed;

  useEffect(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const data = await apiRequest<BikeListResponse>("/bikes", {
          query: { search: trimmed, limit: MAX_PER_GROUP },
          signal: controller.signal,
        });
        setBikeResults({
          query: trimmed,
          items: data.bikes.map((bike) => ({
            id: `bike-${bike._id}`,
            name: bike.name,
            href: `/bikes/${bike.slug}`,
            imageUrl: bike.imageUrl,
            priceText: formatPKR(bike.price),
            category: bike.type === "scooter" ? "Scooter" : "Bike",
          })),
        });
      } catch (error) {
        if (!controller.signal.aborted)
          setBikeResults({ query: trimmed, items: [] });
        if (!(error instanceof DOMException))
          console.error("Search failed", error);
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openSearch = () => {
    setOpen(true);
    if (!extrasRequested.current) {
      extrasRequested.current = true;
      loadExtras().then(setExtras);
    }
  };

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!trimmed) return;
    close();
    router.push(`/vehicles?search=${encodeURIComponent(trimmed)}`);
  };

  const needle = trimmed.toLowerCase();
  const extraMatches = searching
    ? extras
        .filter((item) => item.name.toLowerCase().includes(needle))
        .slice(0, MAX_PER_GROUP)
    : [];
  const results = [...(bikesLoading ? [] : bikeResults.items), ...extraMatches];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={open ? "Close search" : "Search"}
        aria-expanded={open}
        onClick={() => (open ? close() : openSearch())}
        className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:text-brand"
      >
        {open ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-4 top-17 z-50 rounded-2xl border border-white/10 bg-ink-900 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96"
          >
            <form role="search" onSubmit={onSubmit} className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search bikes, accessories, parts"
                aria-label="Search the catalogue"
                aria-controls={listId}
                className="h-11 w-full rounded-lg border border-line bg-ink-850 pl-9 pr-3 text-sm text-white outline-none placeholder:text-faint focus:border-brand"
              />
            </form>

            <div
              id={listId}
              className="mt-2 max-h-80 overflow-y-auto"
              aria-live="polite"
            >
              {!searching ? (
                <p className="px-2 py-3 text-xs text-faint">
                  Type at least {MIN_QUERY_LENGTH} characters.
                </p>
              ) : results.length > 0 ? (
                <ul className="flex flex-col gap-0.5">
                  {results.map((result) => (
                    <li key={result.id}>
                      <Link
                        href={result.href}
                        onClick={close}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/5"
                      >
                        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
                          {result.imageUrl ? (
                            <Image
                              src={result.imageUrl}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-contain p-0.5"
                            />
                          ) : (
                            <ImageOff className="h-4 w-4 text-slate-400" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-white">
                            {result.name}
                          </span>
                          <span className="text-xs text-brand">
                            {result.priceText}
                          </span>
                          <span className="text-xs text-faint">
                            {" "}
                            · {result.category}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : bikesLoading ? (
                <p className="flex items-center gap-2 px-2 py-3 text-xs text-faint">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
                </p>
              ) : (
                <p className="px-2 py-3 text-xs text-faint">
                  No results for “{trimmed}”.
                </p>
              )}
              {bikesLoading && results.length > 0 && (
                <p className="flex items-center gap-2 px-2 py-2 text-xs text-faint">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching
                  vehicles…
                </p>
              )}
            </div>

            {searching && (
              <Link
                href={`/vehicles?search=${encodeURIComponent(trimmed)}`}
                onClick={close}
                className="mt-2 block rounded-lg border-t border-line px-2 pt-3 text-xs font-semibold text-brand hover:underline"
              >
                See all vehicles matching “{trimmed}”
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
