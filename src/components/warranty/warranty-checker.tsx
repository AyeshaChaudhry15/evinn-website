"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { SPEC_FIELDS, specValue } from "@/components/catalog/specs";
import { ProductImage } from "@/components/ui/product-image";
import { buttonPrimary } from "@/components/ui/styles";
import { capitalize, formatPKR } from "@/lib/format";
import type { Bike } from "@/types/api";

export function WarrantyChecker({ bikes }: { bikes: Bike[] }) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Bike | null>(null);
  const [open, setOpen] = useState(false);

  const needle = query.trim().toLowerCase();

  const results = needle
    ? bikes.filter(
        (bike) =>
          bike.name.toLowerCase().includes(needle) ||
          bike.brand?.displayName.toLowerCase().includes(needle),
      )
    : bikes;

  const choose = (bike: Bike) => {
    setSelected(bike);
    setQuery(bike.name);
    setOpen(false);
  };

  const warranty = selected?.specs?.warranty?.trim();

  return (
    <>
      <div
        className="relative"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setOpen(false);
          }
        }}
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-faint" />

        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Search your model"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(null);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Enter" && results[0]) choose(results[0]);
          }}
          placeholder="Search or select your model..."
          className="w-full rounded-xl border border-[#263541] bg-[#0B151E] py-3.5 pl-11 pr-10 text-base text-white outline-none transition-colors focus:border-[#0057D9]/70"
        />

        {query && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => {
              setQuery("");
              setSelected(null);
              setOpen(true);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-[#FF8A00]"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {open && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-10 mt-2 max-h-96 w-full overflow-y-auto rounded-xl border border-[#263541] bg-[#0B151E] shadow-xl"
          >
            {results.length > 0 ? (
              results.map((bike) => (
                <li
                  key={bike._id}
                  role="option"
                  aria-selected={selected?._id === bike._id}
                >
                  <button
                    type="button"
                    onClick={() => choose(bike)}
                    className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors last:border-0 hover:bg-[#101b24]"
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
                      <ProductImage
                        src={bike.imageUrl}
                        alt=""
                        sizes="48px"
                        className="p-1"
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">
                        {bike.name}
                      </span>

                      <span className="text-xs text-faint">
                        {bike.brand?.displayName} · {capitalize(bike.type)}
                      </span>
                    </span>

                    <span className="shrink-0 text-xs text-gray-400">
                      {formatPKR(bike.price)}
                    </span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-sm text-faint">
                No model found for “{query}”.
              </li>
            )}
          </ul>
        )}
      </div>

      {selected && (
        <section
          aria-live="polite"
          className="mt-8 space-y-6 rounded-2xl border border-[#0057D9]/40 bg-[#0B151E] p-6 sm:p-8"
        >
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
              <ProductImage
                src={selected.imageUrl}
                alt={selected.name}
                sizes="80px"
                className="p-1"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0057D9] sm:text-2xl">
                {selected.name}
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                {selected.brand?.displayName} · {formatPKR(selected.price)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#263541] bg-[#08121B] px-5 py-4">
            <p className="text-sm text-gray-400">Warranty Period</p>

            <p className="mt-1 text-xl font-semibold text-[#FF8A00]">
              {warranty && warranty.toUpperCase() !== "N/A"
                ? warranty
                : "Contact us for warranty details"}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SPEC_FIELDS.filter(({ key }) => key !== "warranty").map(
              ({ key, label }) => (
                <div
                  key={key}
                  className="rounded-lg border border-[#263541] bg-[#08121B] px-4 py-3"
                >
                  <dt className="text-xs text-faint">{label}</dt>

                  <dd className="mt-1 text-sm font-medium text-white">
                    {specValue(selected.specs, key)}
                  </dd>
                </div>
              ),
            )}
          </dl>

          <Link
            href="/contact-us?reason=Support"
            className={`${buttonPrimary} rounded-full`}
          >
            Need Help? Contact Us
          </Link>
        </section>
      )}
    </>
  );
}