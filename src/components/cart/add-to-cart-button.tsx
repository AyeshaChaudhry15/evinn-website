"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { cart } from "@/lib/cart";
import { cn } from "@/lib/cn";
import type { Bike } from "@/types/api";

interface AddToCartButtonProps {
  bike: Bike;
  className?: string;
}

export function AddToCartButton({ bike, className }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [added]);

  return (
    <button
      type="button"
      onClick={() => {
        cart.add(bike);
        setAdded(true);
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-hover active:scale-[0.98]",
        className,
      )}
    >
      {added ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      <span aria-live="polite">{added ? "Added to cart" : "Add to Cart"}</span>
    </button>
  );
}
