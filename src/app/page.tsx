import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BikeGrid } from "@/components/catalog/bike-grid";
import { BrandGrid } from "@/components/catalog/brand-grid";
import { Categories } from "@/components/home/categories";
import { Hero } from "@/components/home/hero";
import { Reveal } from "@/components/ui/reveal";
import { getBikes, getBrands } from "@/lib/catalog";

export default async function HomePage() {
  const [brands, latest] = await Promise.allSettled([
    getBrands(),
    getBikes({ limit: 3 }),
  ]);

  return (
    <>
      <Hero />

      {brands.status === "fulfilled" && brands.value.length > 0 && (
        <section id="brands" className="bg-ink-925 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-4xl font-bold text-fg sm:text-5xl">
                  All Brands
                </h2>
                <p className="mt-1 text-lg text-soft sm:text-xl">
                  Explore the electric vehicle brands in one place.
                </p>
              </div>
              <Link
                href="/brands"
                className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
              >
                View all brands <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
            <BrandGrid brands={brands.value.slice(0, 15)} />
          </div>
        </section>
      )}

      <Categories />

      {latest.status === "fulfilled" && latest.value.bikes.length > 0 && (
        <section className="bg-ink-925 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Latest Arrivals
                </h2>
                <p className="mt-1 text-soft">
                  The newest electric bikes and scooters on EVINN.
                </p>
              </div>
              <Link
                href="/vehicles"
                className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
              >
                View all vehicles <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
            <BikeGrid bikes={latest.value.bikes} />
          </div>
        </section>
      )}
    </>
  );
}
