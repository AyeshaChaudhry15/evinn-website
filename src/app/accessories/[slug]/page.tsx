import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/catalog/product-detail";
import { getAccessory } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: PageProps<"/accessories/[slug]">): Promise<Metadata> {
  const accessory = await getAccessory((await params).slug);
  if (!accessory) return { title: "Accessory not found" };

  return {
    title: accessory.name,
    description:
      accessory.description || `${accessory.name}: ${accessory.priceText}`,
    openGraph: {
      images: accessory.imageUrl ? [accessory.imageUrl] : undefined,
    },
  };
}

export default async function AccessoryPage({
  params,
}: PageProps<"/accessories/[slug]">) {
  const accessory = await getAccessory((await params).slug);
  if (!accessory) notFound();

  return <ProductDetail kind="accessories" product={accessory} />;
}
