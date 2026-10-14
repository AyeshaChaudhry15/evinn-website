import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { WarrantyChecker } from "@/components/warranty/warranty-checker";
import { errorMessage } from "@/lib/api";
import { getAllBikes } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Check Warranty",
  description:
    "Check the warranty coverage for your electric bike or scooter model.",
};

export default async function CheckWarrantyPage() {
  const result = await getAllBikes().then(
    (bikes) => ({ bikes, error: null }),
    (error: unknown) => ({ bikes: [], error: errorMessage(error) }),
  );

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <Link
        href="/warranty"
        className="inline-flex items-center gap-1.5 text-sm text-[#0057D9] transition-colors hover:text-[#FF8A00] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Warranty information
      </Link>

      <div className="mt-6 mb-3 flex items-center gap-3">
        <ShieldCheck
          className="h-8 w-8 text-[#0057D9]"
          strokeWidth={1.5}
          aria-hidden
        />

        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Check Warranty for Your Model
        </h1>
      </div>

      <p className="mb-8 text-base text-gray-400 sm:text-lg">
        Select your model to check its warranty coverage and details.
      </p>

      {result.error ? (
        <EmptyState
          tone="error"
          title="We couldn't load models"
          description={result.error}
        />
      ) : (
        <WarrantyChecker bikes={result.bikes} />
      )}
    </section>
  );
}