import type { Metadata } from "next";
import { ProductCatalog } from "@/components/catalog/product-catalog";

export const metadata: Metadata = {
  title: "Accessories",
  description:
    "Chargers, helmets, locks and more premium accessories for your electric bike or scooter.",
};

export default async function AccessoriesPage({
  searchParams,
}: PageProps<"/accessories">) {
  return (
    <ProductCatalog
      kind="accessories"
      searchParams={await searchParams}
    />
  );
}