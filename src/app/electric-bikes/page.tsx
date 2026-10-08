import type { Metadata } from "next";
import { BikeCatalog } from "@/components/catalog/bike-catalog";
import { PageHeader } from "@/components/ui/page-header";
import { container } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Electric Bikes",
  description:
    "High-performance electric bikes for modern, sustainable transportation in Pakistan.",
};

export default async function ElectricBikesPage({
  searchParams,
}: PageProps<"/electric-bikes">) {
  return (
    <div className={`${container} py-10 lg:py-14`}>
      <PageHeader
        title="Electric Bikes"
        description="Explore our collection of high-performance electric bikes built for modern and sustainable transportation."
      />
      <BikeCatalog
        pathname="/electric-bikes"
        searchParams={await searchParams}
        type="bike"
        noun="bikes"
      />
    </div>
  );
}
