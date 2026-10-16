import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import type { BrandSummary } from "@/types/api";

export function BrandGrid({
  brands,
}: {
  brands: BrandSummary[];
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {brands.map((brand, index) => (
        <Reveal
          key={brand._id}
          as="li"
          delay={Math.min(index, 10) * 0.03}
        >
          <Link
            href={`/brands/${brand._id}`}
            className="
              group
              flex
              h-28
              flex-col
              items-center
              justify-center
              gap-2
              rounded-lg

              border
              border-blue-500/30

              bg-ink-850
              px-3

              transition-all
              duration-200

              hover:border-[#FF8A00]
              hover:bg-[#FF8A00]/5

              hover:shadow-[0_0_18px_rgba(255,138,0,0.12)]
            "
          >
            {brand.logoUrl ? (
              <span className="relative h-14 w-full">
                <Image
                  src={brand.logoUrl}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 45vw, 200px"
                  className="
                    object-contain
                    transition-transform
                    duration-200
                    group-hover:scale-105
                  "
                />
              </span>
            ) : null}

            <span
              className="
                text-sm
                font-semibold
                text-soft

                transition-colors
                duration-200

                group-hover:text-[#FF8A00]
              "
            >
              {brand.displayName}
            </span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}