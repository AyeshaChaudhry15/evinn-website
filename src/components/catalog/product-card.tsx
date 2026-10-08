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
      className="group flex h-full flex-col rounded-xl border border-line bg-ink-900 p-3 transition-colors duration-300 hover:border-line-strong hover:bg-ink-800"
    >
      <div className="relative h-36 overflow-hidden rounded-lg bg-ink-850">
        <ProductImage
          src={product.imageUrl}
          alt=""
          sizes="(max-width: 768px) 45vw, 22vw"
          className="p-3 transition-transform duration-300 group-hover:scale-105"
        />
        <span
          className={cn(
            "absolute left-2 top-2 rounded-md px-2 py-0.5 text-[11px] font-semibold",
            product.inStock
              ? "bg-brand/15 text-brand"
              : "bg-red-500/15 text-red-300",
          )}
        >
          {product.inStock ? "In stock" : "Out of stock"}
        </span>
      </div>
      <h3 className="mt-3 text-sm font-medium text-white">{product.name}</h3>
      <p className="mt-0.5 text-sm font-semibold text-brand-soft">
        {product.priceText}
      </p>
    </Link>
  );
}
