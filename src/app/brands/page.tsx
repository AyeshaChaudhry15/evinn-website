import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { BrandGrid } from "@/components/catalog/brand-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { container } from "@/components/ui/styles";
import { errorMessage } from "@/lib/api";
import { getBrands } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "All Brands",
  description: "Electric bike and scooter brands available on EVINN.",
};

export default async function BrandsPage() {
  const result = await getBrands().then(
    (brands) => ({ brands, error: null }),
    (error: unknown) => ({ brands: [], error: errorMessage(error) }),
  );

  return (
    <div className={`${container} py-10 lg:py-14`}>
      <PageHeader title="All Brands" description="Explore the electric vehicle brands in one place." />

      {result.error ? (
        <EmptyState tone="error" title="We couldn't load brands" description={result.error} />
      ) : result.brands.length === 0 ? (
        <EmptyState icon={<Building2 className="h-7 w-7" />} title="No brands yet" />
      ) : (
        <BrandGrid brands={result.brands} />
      )}
    </div>
  );
}
