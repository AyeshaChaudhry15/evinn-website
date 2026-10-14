import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  GitCompareArrows,
  Star,
} from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { BikeGrid } from "@/components/catalog/bike-grid";
import { SPEC_FIELDS, specValue } from "@/components/catalog/specs";
import { ProductImage } from "@/components/ui/product-image";
import { Reveal } from "@/components/ui/reveal";
import {
  buttonOutline,
  buttonSecondary,
  container,
} from "@/components/ui/styles";
import { getBike, getBikes } from "@/lib/catalog";
import { capitalize, formatPKR } from "@/lib/format";
import type { Bike } from "@/types/api";

export async function generateMetadata({
  params,
}: PageProps<"/bikes/[slug]">): Promise<Metadata> {
  const bike = await getBike((await params).slug);
  if (!bike) return { title: "Vehicle not found" };

  const description = `${bike.name} by ${bike.brand?.displayName ?? "EVINN"}: ${formatPKR(bike.price)}, ${specValue(bike.specs, "range")} range, ${specValue(bike.specs, "topSpeed")} top speed.`;

  return {
    title: bike.name,
    description,
    openGraph: {
      title: bike.name,
      description,
      images: bike.imageUrl ? [bike.imageUrl] : undefined,
    },
  };
}

async function getRelatedBikes(bike: Bike) {
  if (!bike.brand?._id) return [];

  try {
    const { bikes } = await getBikes({
      brand: bike.brand._id,
      limit: 4,
    });

    return bikes
      .filter((item) => item._id !== bike._id)
      .slice(0, 3);
  } catch {
    return [];
  }
}

export default async function BikeDetailPage({
  params,
}: PageProps<"/bikes/[slug]">) {
  const bike = await getBike((await params).slug);

  if (!bike) notFound();

  const related = await getRelatedBikes(bike);

  const listing =
    bike.type === "scooter"
      ? {
          href: "/electric-scooters",
          label: "Electric Scooters",
        }
      : {
          href: "/electric-bikes",
          label: "Electric Bikes",
        };

  const testRideHref = bike.brand?._id
    ? `/book-test-ride?brand=${bike.brand._id}&bike=${bike._id}`
    : "/book-test-ride";

  return (
    <>
      <section className="border-b border-[#263541] bg-[#07131D]">
        <div className={`${container} py-8`}>
          <Link
            href={listing.href}
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#B8C1CA] transition-colors hover:text-[#FF8A00]"
          >
            <ArrowLeft className="h-4 w-4" />
            {listing.label}
          </Link>

          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <Reveal className="relative min-h-80 overflow-hidden rounded-2xl border border-[#263541] bg-white sm:min-h-115">
              <ProductImage
                src={bike.imageUrl}
                alt={bike.name}
                preload
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="p-8"
              />
            </Reveal>

            <Reveal delay={0.1}>
              {bike.brand && (
                <Link
                  href={`/brands/${bike.brand._id}`}
                  className="text-sm font-bold uppercase tracking-[2px] text-[#FF8A00] hover:underline"
                >
                  {bike.brand.displayName}
                </Link>
              )}

              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {bike.name}
              </h1>

              <p className="mt-3 text-sm text-[#B8C1CA]">
                Electric {capitalize(bike.type)}
              </p>

              {bike.rating > 0 && (
                <p className="mt-5 flex items-center gap-2 text-sm text-[#B8C1CA]">
                  <Star
                    className="h-5 w-5 fill-[#FF8A00] text-[#FF8A00]"
                    aria-hidden
                  />

                  <span className="font-bold text-white">
                    {bike.rating}
                  </span>{" "}
                  / 5 rating
                </p>
              )}

              <p className="mt-7 text-sm text-[#8F9BA6]">
                Price
              </p>

              <p className="mt-1 text-3xl font-extrabold text-[#FF8A00]">
                {formatPKR(bike.price)}
              </p>

              <p className="mt-1 text-xs text-[#77848F]">
                Pay cash on delivery. We call you to confirm every order.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <AddToCartButton
                  bike={bike}
                  className="h-13 rounded-xl bg-[#FF8A00] text-sm font-bold text-[#07131D] hover:bg-[#FF9F2D]"
                />

                <Link
                  href={`/checkout?bike=${bike.slug}`}
                  className={`${buttonOutline} h-13 rounded-xl border-[#FF8A00] text-[#FF8A00] hover:bg-[#FF8A00] hover:text-[#07131D]`}
                >
                  Buy Now
                </Link>

                <Link
                  href={testRideHref}
                  className={`${buttonSecondary} h-12 border-[#263541] text-[#D7DDE2] hover:border-[#FF8A00] hover:text-[#FF8A00]`}
                >
                  <CalendarCheck className="h-4 w-4" />
                  Book a Test Ride
                </Link>

                <Link
                  href={`/compare-vehicles?bikes=${bike.slug}`}
                  className={`${buttonSecondary} h-12 border-[#263541] text-[#D7DDE2] hover:border-[#FF8A00] hover:text-[#FF8A00]`}
                >
                  <GitCompareArrows className="h-4 w-4" />
                  Compare
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section
        className={`${container} bg-[#07131D] py-12`}
      >
        <Reveal>
          <h2 className="text-2xl font-bold text-white">
            {bike.name} Overview
          </h2>

          <p className="mt-4 max-w-4xl text-sm leading-7 text-[#B8C1CA]">
            The {bike.name} is an electric {bike.type} from{" "}
            {bike.brand?.displayName ?? "EVINN"} with a range of{" "}
            {specValue(bike.specs, "range")}, a top speed of{" "}
            {specValue(bike.specs, "topSpeed")} and a{" "}
            {specValue(bike.specs, "battery")} battery that charges in{" "}
            {specValue(bike.specs, "chargingTime")}.
          </p>
        </Reveal>

        <h2 className="mt-12 mb-5 text-2xl font-bold text-white">
          Specifications
        </h2>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SPEC_FIELDS.map(
            ({ key, label, icon: Icon }, index) => (
              <Reveal
                key={key}
                delay={index * 0.04}
                className="rounded-xl border border-[#263541] bg-[#0D1720] p-5"
              >
                <Icon
                  className="h-5 w-5 text-[#FF8A00]"
                  aria-hidden
                />

                <dt className="mt-4 text-sm text-[#8F9BA6]">
                  {label}
                </dt>

                <dd className="mt-1 font-bold text-white">
                  {specValue(bike.specs, key)}
                </dd>
              </Reveal>
            ),
          )}

          <Reveal
            delay={0.28}
            className="rounded-xl border border-[#263541] bg-[#0D1720] p-5"
          >
            <GitCompareArrows
              className="h-5 w-5 text-[#FF8A00]"
              aria-hidden
            />

            <dt className="mt-4 text-sm text-[#8F9BA6]">
              Vehicle Type
            </dt>

            <dd className="mt-1 font-bold text-white">
              {capitalize(bike.type)}
            </dd>
          </Reveal>
        </dl>
      </section>

      {related.length > 0 && (
        <section
          className={`${container} bg-[#07131D] pb-16`}
        >
          <h2 className="mb-6 text-2xl font-bold text-white">
            More from {bike.brand?.displayName}
          </h2>

          <BikeGrid bikes={related} />
        </section>
      )}
    </>
  );
}