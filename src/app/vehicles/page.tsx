import type { Metadata } from "next";
import { BikeCatalog } from "@/components/catalog/bike-catalog";
import { PageHeader } from "@/components/ui/page-header";
import { container } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "All Electric Vehicles",
  description:
    "Browse electric bikes and scooters from top brands in Pakistan. Filter by brand, price, top speed and range.",
};

export default async function VehiclesPage({
  searchParams,
}: PageProps<"/vehicles">) {
  return (
    <div className={`${container} py-10 lg:py-14`}>
      <PageHeader
        title="All Electric Vehicles"
        description="Explore our wide range of electric bikes and scooters from top brands."
      />
      <BikeCatalog pathname="/vehicles" searchParams={await searchParams} />
    </div>
  );
}
