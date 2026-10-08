"use client";

// Hands the checkout result to the confirmation page through sessionStorage,
// so a refresh of /order-placed still shows it but it never outlives the tab.

import { useSyncExternalStore } from "react";
import type { PlacedOrder } from "@/types/api";

const STORAGE_KEY = "evinn:last-order";

export interface CheckoutResult {
  message: string;
  orders: PlacedOrder[];
  /** Cart lines that could not be ordered (e.g. rate limit); they stay in the cart. */
  failed: { name: string; reason: string }[];
}

let cachedRaw: string | null = null;
let cachedValue: CheckoutResult | null = null;

export function saveCheckoutResult(result: CheckoutResult) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // Storage unavailable: the confirmation page falls back to its empty state.
  }
}

function getSnapshot(): CheckoutResult | null {
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = raw ? (JSON.parse(raw) as CheckoutResult) : null;
      cachedValue = parsed && Array.isArray(parsed.orders) ? parsed : null;
    } catch {
      cachedValue = null;
    }
  }

  return cachedValue;
}

const subscribe = () => () => {};

export function useCheckoutResult() {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
