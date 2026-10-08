"use client";

// Cart persisted in localStorage and read through useSyncExternalStore, so the server render and
// the first client render agree (empty cart) and the saved cart appears right after hydration.
// Only bikes can be ordered through the API (one order per bike, quantity 1-10), so the cart holds bikes only.

import { useSyncExternalStore } from "react";
import type { Bike } from "@/types/api";

export const MAX_QUANTITY = 10;

export interface CartItem {
  bikeId: string;
  slug: string;
  name: string;
  brandName: string;
  imageUrl: string;
  /** Price when added, for display only. The API always charges the bike's current price. */
  price: number;
  quantity: number;
}

const STORAGE_KEY = "evinn:cart";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const clampQuantity = (quantity: number) =>
  Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)));

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.bikeId === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number"
  );
}

function readStorage(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(isCartItem).map((item) => ({
      ...item,
      brandName: item.brandName ?? "",
      imageUrl: item.imageUrl ?? "",
      quantity: clampQuantity(item.quantity),
    }));
  } catch {
    return EMPTY;
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  items = readStorage();
}

function commit(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode or full storage: the cart still works for this tab.
  }
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  items = readStorage();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  ensureLoaded();
  return items;
}

const getServerSnapshot = () => EMPTY;

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCartCount() {
  return useCart().reduce((total, item) => total + item.quantity, 0);
}

export const cart = {
  add(bike: Bike, quantity = 1) {
    ensureLoaded();
    const existing = items.find((item) => item.bikeId === bike._id);

    if (existing) {
      cart.setQuantity(bike._id, existing.quantity + quantity);
      return;
    }

    commit([
      ...items,
      {
        bikeId: bike._id,
        slug: bike.slug,
        name: bike.name,
        brandName: bike.brand?.displayName ?? "",
        imageUrl: bike.imageUrl,
        price: bike.price,
        quantity: clampQuantity(quantity),
      },
    ]);
  },

  setQuantity(bikeId: string, quantity: number) {
    ensureLoaded();
    commit(
      items.map((item) =>
        item.bikeId === bikeId ? { ...item, quantity: clampQuantity(quantity) } : item,
      ),
    );
  },

  remove(bikeIds: string | string[]) {
    ensureLoaded();
    const ids = new Set(Array.isArray(bikeIds) ? bikeIds : [bikeIds]);
    commit(items.filter((item) => !ids.has(item.bikeId)));
  },
};
