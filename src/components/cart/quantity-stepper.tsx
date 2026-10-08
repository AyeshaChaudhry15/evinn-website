"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_QUANTITY } from "@/lib/cart";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

export function QuantityStepper({
  value,
  onChange,
  label,
}: QuantityStepperProps) {
  return (
    <div
      className="flex h-9 items-center rounded-md border border-white/10 bg-ink-950"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
        className="flex h-full w-9 items-center justify-center text-gray-400 transition-colors hover:text-white disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-7 text-center text-sm text-white" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QUANTITY}
        aria-label="Increase quantity"
        className="flex h-full w-9 items-center justify-center text-gray-400 transition-colors hover:text-white disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
