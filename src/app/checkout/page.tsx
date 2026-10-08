import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getBike } from "@/lib/catalog";
import { firstParam } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default async function CheckoutPage({
  searchParams,
}: PageProps<"/checkout">) {
  const slug = firstParam((await searchParams).bike);
  const directBike = slug ? await getBike(slug) : undefined;
  if (directBike === null) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-semibold text-white">Checkout</h1>
      <CheckoutForm directBike={directBike} />
    </div>
  );
}
