import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/checkout/order-confirmation";

export const metadata: Metadata = {
  title: "Order Placed",
  robots: { index: false },
};

export default function OrderPlacedPage() {
  return (
    <div className="mx-auto max-w-225 px-4 py-10 sm:px-6 lg:px-8">
      <OrderConfirmation />
    </div>
  );
}
