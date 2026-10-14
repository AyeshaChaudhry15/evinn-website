"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Plus, X } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { SPEC_FIELDS, specValue } from "@/components/catalog/specs";
import { ProductImage } from "@/components/ui/product-image";
import { buttonSecondary, select } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { capitalize, formatPKR } from "@/lib/format";
import type { Bike } from "@/types/api";

const MAX_COLUMNS = 3;

interface CompareVehiclesProps {
  bikes: Bike[];
  initialIds: string[];
}

const cell =
  "rounded-lg border border-[#1d2b38] bg-[#0a141e] px-3 py-3 text-center text-sm";

export function CompareVehicles({
  bikes,
  initialIds,
}: CompareVehiclesProps) {
  const [selectedIds, setSelectedIds] = useState(initialIds);

  const byId = useMemo(
    () => new Map(bikes.map((bike) => [bike._id, bike])),
    [bikes],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Bike[]>();

    for (const bike of bikes) {
      const brand = bike.brand?.displayName ?? "Other";
      map.set(brand, [...(map.get(brand) ?? []), bike]);
    }

    return [...map.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    );
  }, [bikes]);

  const columns = selectedIds
    .map((id) => byId.get(id))
    .filter((bike): bike is Bike => Boolean(bike));

  const replaceAt = (index: number, id: string) =>
    setSelectedIds((ids) =>
      ids.map((current, i) => (i === index ? id : current)),
    );

  const addColumn = () => {
    const next = bikes.find(
      (bike) => !selectedIds.includes(bike._id),
    );

    if (next) {
      setSelectedIds((ids) => [...ids, next._id]);
    }
  };

  const removeAt = (index: number) =>
    setSelectedIds((ids) =>
      ids.filter((_, i) => i !== index),
    );

  const rows: {
    label: string;
    value: (bike: Bike) => string;
  }[] = [
    {
      label: "Price",
      value: (bike) => formatPKR(bike.price),
    },
    {
      label: "Type",
      value: (bike) => capitalize(bike.type),
    },
    ...SPEC_FIELDS.map(({ key, label }) => ({
      label,
      value: (bike: Bike) => specValue(bike.specs, key),
    })),
    {
      label: "Rating",
      value: (bike) =>
        bike.rating > 0 ? `${bike.rating} / 5` : "—",
    },
  ];

  return (
    <>
      <div className="overflow-x-auto pb-2">
        <table className="w-full min-w-160 table-fixed border-separate border-spacing-2">
          <thead>
            <tr>
              <th scope="col" className="w-40 align-bottom">
                <span className="sr-only">Feature</span>
              </th>

              {columns.map((bike, index) => (
                <th
                  key={`${bike._id}-${index}`}
                  scope="col"
                  className="rounded-lg border border-[#1d2b38] bg-[#0a141e] p-3 align-top font-normal"
                >
                  <div className="flex items-start gap-2">
                    <div className="relative flex-1">
                      <label
                        htmlFor={`compare-${index}`}
                        className="sr-only"
                      >
                        Vehicle {index + 1}
                      </label>

                      <select
                        id={`compare-${index}`}
                        value={bike._id}
                        onChange={(event) =>
                          replaceAt(index, event.target.value)
                        }
                        className={cn(
                          select,
                          "border-[#1d2b38] bg-[#0a141e] py-2 text-xs font-semibold text-white focus:border-[#0057D9] focus:ring-[#0057D9]",
                        )}
                      >
                        {groups.map(([brand, items]) => (
                          <optgroup key={brand} label={brand}>
                            {items.map((item) => (
                              <option
                                key={item._id}
                                value={item._id}
                              >
                                {item.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FF8A00]" />
                    </div>

                    {columns.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAt(index)}
                        aria-label={`Remove ${bike.name}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-[#FF8A00]/10 hover:text-[#FF8A00]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <Link
                    href={`/bikes/${bike.slug}`}
                    className="relative mt-3 block h-28 rounded-md bg-white"
                  >
                    <ProductImage
                      src={bike.imageUrl}
                      alt={bike.name}
                      sizes="240px"
                      className="p-2"
                    />
                  </Link>

                  <p className="mt-2 truncate text-xs text-gray-500">
                    {bike.brand?.displayName}
                  </p>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th
                  scope="row"
                  className={cn(
                    cell,
                    "font-semibold text-gray-200",
                  )}
                >
                  {row.label}
                </th>

                {columns.map((bike, index) => (
                  <td
                    key={`${bike._id}-${index}`}
                    className={cn(
                      cell,
                      row.label === "Price"
                        ? "font-semibold text-[#FF8A00]"
                        : "text-gray-200",
                    )}
                  >
                    {row.value(bike)}
                  </td>
                ))}
              </tr>
            ))}

            <tr>
              <td />

              {columns.map((bike, index) => (
                <td
                  key={`${bike._id}-${index}`}
                  className="pt-1"
                >
                  <AddToCartButton
                    bike={bike}
                    className="h-10 w-full"
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {columns.length <
        Math.min(MAX_COLUMNS, bikes.length) && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={addColumn}
            className={cn(
              buttonSecondary,
              "border-[#0057D9] text-[#0057D9] hover:bg-[#0057D9]/10",
            )}
          >
            <Plus className="h-4 w-4" />
            Add Another Vehicle
          </button>
        </div>
      )}
    </>
  );
}