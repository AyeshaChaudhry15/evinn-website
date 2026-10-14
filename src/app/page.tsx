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
        <section
          id="brands"
          className="bg-[#06111F] px-4 py-14 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-4xl font-bold sm:text-5xl">
                  <span className="text-[#0057D9]">All</span>{" "}
                  <span className="text-[#FF8A00]">Brands</span>
                </h2>

                <p className="mt-1 text-lg text-gray-400 sm:text-xl">
                  Explore the electric vehicle brands in one place.
                </p>
              </div>

              <Link
                href="/brands"
                className="flex items-center gap-1.5 text-sm font-semibold text-[#FF8A00] transition-colors hover:text-[#0057D9] hover:underline"
              >
                View all brands
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <BrandGrid brands={brands.value.slice(0, 15)} />
          </div>
        </section>
      )}

      <Categories />

      {latest.status === "fulfilled" && latest.value.bikes.length > 0 && (
        <section className="bg-[#06111F] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">
                  <span className="text-[#0057D9]">Latest</span>{" "}
                  <span className="text-[#FF8A00]">Arrivals</span>
                </h2>

                <p className="mt-1 text-gray-400">
                  The newest electric bikes and scooters on EVINN.
                </p>
              </div>

              <Link
                href="/vehicles"
                className="flex items-center gap-1.5 text-sm font-semibold text-[#FF8A00] transition-colors hover:text-[#0057D9] hover:underline"
              >
                View all vehicles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <BikeGrid bikes={latest.value.bikes} />
          </div>
        </section>
      )}
    </>
  );
}