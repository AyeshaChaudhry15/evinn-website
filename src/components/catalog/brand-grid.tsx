import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import type { BrandSummary } from "@/types/api";

export function BrandGrid({ brands }: { brands: BrandSummary[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {brands.map((brand, index) => (
        <Reveal key={brand._id} as="li" delay={Math.min(index, 10) * 0.03}>
          <Link
            href={`/brands/${brand._id}`}
            className="group flex h-28 flex-col items-center justify-center gap-2 rounded-lg border border-line bg-ink-850 px-3 transition-colors duration-200 hover:border-brand-soft hover:bg-ink-800"
          >
            {brand.logoUrl ? (
              <span className="relative h-14 w-full">
                <Image
                  src={brand.logoUrl}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 45vw, 200px"
                  className="object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </span>
            ) : null}
            <span className="text-sm font-semibold text-soft group-hover:text-white">
              {brand.displayName}
            </span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
