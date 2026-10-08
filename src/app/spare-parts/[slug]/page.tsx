import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/catalog/product-detail";
import { getSparePart } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: PageProps<"/spare-parts/[slug]">): Promise<Metadata> {
  const sparePart = await getSparePart((await params).slug);
  if (!sparePart) return { title: "Spare part not found" };

  return {
    title: sparePart.name,
    description:
      sparePart.description || `${sparePart.name}: ${sparePart.priceText}`,
    openGraph: {
      images: sparePart.imageUrl ? [sparePart.imageUrl] : undefined,
    },
  };
}

export default async function SparePartPage({
  params,
}: PageProps<"/spare-parts/[slug]">) {
  const sparePart = await getSparePart((await params).slug);
  if (!sparePart) notFound();

  return <ProductDetail kind="spare-parts" product={sparePart} />;
}
