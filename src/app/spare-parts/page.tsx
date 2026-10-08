import type { Metadata } from "next";
import { ProductCatalog } from "@/components/catalog/product-catalog";

export const metadata: Metadata = {
  title: "Spare Parts",
  description:
    "Genuine batteries, tyres, brake pads and other spare parts for electric bikes and scooters.",
};

export default async function SparePartsPage({
  searchParams,
}: PageProps<"/spare-parts">) {
  return (
    <ProductCatalog kind="spare-parts" searchParams={await searchParams} />
  );
}
