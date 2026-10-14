import type { Metadata } from "next";
import { KeyRound, ShieldCheck, Zap } from "lucide-react";
import { TestRideForm } from "@/components/forms/test-ride-form";
import { Alert } from "@/components/ui/alert";
import { Reveal } from "@/components/ui/reveal";
import { errorMessage } from "@/lib/api";
import { getAllBikes, getBrands } from "@/lib/catalog";
import { firstParam } from "@/lib/search-params";
import { isObjectId } from "@/lib/validation";
import type { Brand } from "@/types/api";

export const metadata: Metadata = {
  title: "Book a Test Ride",
  description:
    "Experience an electric bike or scooter before you buy. Book a free test ride with EVINN.",
};

const PERKS = [
  { icon: KeyRound, label: "Free Test Ride" },
  { icon: ShieldCheck, label: "No Obligation" },
  { icon: Zap, label: "Quick Booking" },
];

export default async function BookTestRidePage({
  searchParams,
}: PageProps<"/book-test-ride">) {
  const query = await searchParams;

  let brands: Brand[] = [];
  let loadError = "";

  try {
    brands = await getBrands();
  } catch (error) {
    loadError = errorMessage(error);
  }

  const brandParam = firstParam(query.brand) ?? "";

  const initialBrand = brands.some(
    (brand) => brand._id === brandParam,
  )
    ? brandParam
    : "";

  const initialBikes = initialBrand
    ? await getAllBikes({ brand: initialBrand }).catch(() => [])
    : [];

  const bikeParam = firstParam(query.bike) ?? "";

  const initialBike =
    isObjectId(bikeParam) &&
    initialBikes.some((bike) => bike._id === bikeParam)
      ? bikeParam
      : "";

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-[#07131D] px-4 py-10 sm:px-6 md:py-14">
      <Reveal className="mx-auto w-full max-w-3xl rounded-2xl border border-[#263541] bg-[#0D1720] p-6 shadow-2xl sm:p-8 md:p-10">
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-[#0057D9]">Book a</span>{" "}
            <span className="text-[#FF8A00]">Test Ride</span>
          </h1>

          <p className="mt-2 text-sm text-[#B8C1CA] sm:text-base">
            Experience the future, before you buy.
          </p>
        </div>

        {loadError ? (
          <Alert tone="error">
            We couldn&apos;t load brands right now: {loadError}
          </Alert>
        ) : (
          <TestRideForm
            key={`${initialBrand}|${initialBike}`}
            brands={brands}
            today={today}
            initialBrand={initialBrand}
            initialBike={initialBike}
            initialBikes={initialBikes.map(({ _id, name }) => ({
              _id,
              name,
            }))}
          />
        )}
      </Reveal>

      <ul className="mx-auto mt-8 grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
        {PERKS.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-3 rounded-xl border border-[#263541] bg-[#0D1720] p-4 transition-colors hover:border-[#FF8A00]/50"
          >
            <span className="rounded-full bg-[#FF8A00]/10 p-2 text-[#FF8A00]">
              <Icon className="h-5 w-5" aria-hidden />
            </span>

            <span className="text-sm font-medium text-[#E5EAF0]">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}