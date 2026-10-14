import Link from "next/link";
import { Star } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductImage } from "@/components/ui/product-image";
import { capitalize, formatPKR } from "@/lib/format";
import type { Bike } from "@/types/api";

export function BikeCard({ bike }: { bike: Bike }) {
  const href = `/bikes/${bike.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#1d2b38] bg-[#0a141e] transition duration-300 hover:-translate-y-1 hover:border-[#0057D9]/50 hover:shadow-[0_14px_35px_rgba(0,87,217,0.15)]">
      <Link
        href={href}
        className="relative block h-52 bg-white"
        tabIndex={-1}
        aria-hidden
      >
        <ProductImage
          src={bike.imageUrl}
          alt=""
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="p-4 transition duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-gray-500">
          {bike.brand?.displayName ?? "EVINN"} · {capitalize(bike.type)}
        </p>

        <h3 className="mt-1 truncate text-[15px] font-semibold text-white">
          <Link
            href={href}
            className="transition-colors hover:text-[#0057D9]"
          >
            {bike.name}
          </Link>
        </h3>

        <div className="mt-2 mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-[#FF8A00]">
            {formatPKR(bike.price)}
          </p>

          {bike.rating > 0 && (
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <Star
                className="h-3.5 w-3.5 fill-[#FF8A00] text-[#FF8A00]"
                aria-hidden
              />

              <span>
                {bike.rating}
                <span className="sr-only"> out of 5</span>
              </span>
            </p>
          )}
        </div>

        <AddToCartButton
          bike={bike}
          className="mt-auto h-10 w-full"
        />
      </div>
    </article>
  );
}