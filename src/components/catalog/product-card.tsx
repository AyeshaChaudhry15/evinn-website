import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { cn } from "@/lib/cn";
import type { Accessory } from "@/types/api";

export function ProductCard({
  product,
  href,
}: {
  product: Accessory;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-xl border border-[#1d2b38] bg-[#0a141e] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#0057D9]/60 hover:bg-[#0d1924] hover:shadow-[0_14px_35px_rgba(0,87,217,0.15)]"
    >
      <div className="relative h-36 overflow-hidden rounded-lg bg-white">
        <ProductImage
          src={product.imageUrl}
          alt=""
          sizes="(max-width: 768px) 45vw, 22vw"
          className="p-3 transition-transform duration-300 group-hover:scale-105"
        />

        <span
          className={cn(
            "absolute left-2 top-2 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
            product.inStock
              ? "border-[#0057D9]/40 bg-[#0057D9]/15 text-[#0057D9]"
              : "border-red-500/30 bg-red-500/15 text-red-300",
          )}
        >
          {product.inStock ? "In stock" : "Out of stock"}
        </span>
      </div>

      <h3 className="mt-3 text-sm font-medium text-white transition-colors group-hover:text-[#0057D9]">
        {product.name}
      </h3>

      <p className="mt-0.5 text-sm font-semibold text-[#FF8A00]">
        {product.priceText}
      </p>
    </Link>
  );
}