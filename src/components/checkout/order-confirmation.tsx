"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CreditCard,
  MapPin,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonPrimary, buttonSecondary } from "@/components/ui/styles";
import { formatDateTime, formatPKR } from "@/lib/format";
import { useCheckoutResult } from "@/lib/last-order";
import { useHydrated } from "@/lib/use-hydrated";

export function OrderConfirmation() {
  const hydrated = useHydrated();
  const result = useCheckoutResult();
  const reduceMotion = useReducedMotion();

  if (!hydrated) {
    return (
      <div
        className="h-96 animate-pulse rounded-2xl border border-[#1d2b38] bg-[#0a141e]"
        aria-busy="true"
      />
    );
  }

  if (!result || result.orders.length === 0) {
    return (
      <EmptyState
        title="No recent order found"
        description="Your order details are only kept for this browser tab."
        action={
          <Link
            href="/vehicles"
            className={`${buttonPrimary} !bg-[#FF8A00] !text-white hover:!bg-[#e67b00]`}
          >
            Continue Shopping
          </Link>
        }
      />
    );
  }

  const { orders, failed, message } = result;
  const address = orders[0].shippingAddress;
  const grandTotal = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );

  return (
    <>
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-[#FF8A00] shadow-[0_0_25px_rgba(255,138,0,0.25)]"
        >
          <Check
            className="h-12 w-12 text-[#FF8A00]"
            strokeWidth={3}
            aria-hidden
          />
        </motion.div>

        <h1 className="mt-7 text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="text-[#0057D9]">Order</span>{" "}
          <span className="text-[#FF8A00]">Placed!</span>
        </h1>

        <p className="mt-2 max-w-md text-sm text-gray-400 sm:text-base">
          {message}
        </p>
      </div>

      {failed.length > 0 && (
        <div
          role="alert"
          className="mt-8 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />

          <div>
            <p className="font-semibold">
              Some items weren&apos;t ordered and are still in your cart:
            </p>

            <ul className="mt-1 list-inside list-disc">
              {failed.map((item) => (
                <li key={item.name}>
                  {item.name}: {item.reason}
                </li>
              ))}
            </ul>

            <Link
              href="/cart"
              className="mt-2 inline-block font-semibold text-[#FF8A00] underline"
            >
              Go to cart
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border border-[#1d2b38] bg-[#0a141e]">
        <ul className="divide-y divide-[#1d2b38]">
          {orders.map((order) => (
            <li
              key={order._id}
              className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div>
                <p className="text-xs text-gray-500">
                  Order{" "}
                  <span className="font-mono text-gray-300">
                    #{order._id}
                  </span>
                </p>

                <p className="mt-1 font-semibold text-white">
                  {order.bikeName}
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  {order.quantity} × {formatPKR(order.unitPrice)} · Placed{" "}
                  {formatDateTime(order.createdAt)}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="font-semibold text-white">
                  {formatPKR(order.totalAmount)}
                </p>

                <span className="mt-1 inline-block rounded-full bg-[#0057D9]/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-[#0057D9]">
                  {order.status}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-[#1d2b38] px-5 py-4 sm:px-6">
          <span className="text-lg font-bold text-white">
            Total Amount
          </span>

          <span className="text-xl font-bold text-[#FF8A00]">
            {formatPKR(grandTotal)}
          </span>
        </div>

        <div className="grid gap-6 border-t border-[#1d2b38] px-5 py-6 sm:grid-cols-2 sm:px-6">
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <MapPin
                className="h-4 w-4 text-[#FF8A00]"
                aria-hidden
              />
              Shipping address
            </h2>

            <address className="text-sm not-italic leading-6 text-gray-400">
              <span className="text-gray-200">{address.fullName}</span>
              <br />
              <span className="whitespace-pre-line">
                {address.address}
              </span>
              <br />
              {address.city} - {address.postalCode}
              <br />
              {address.phoneNumber}
            </address>
          </div>

          <div>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <CreditCard
                className="h-4 w-4 text-[#FF8A00]"
                aria-hidden
              />
              Payment method
            </h2>

            <p className="text-sm capitalize text-gray-400">
              {orders[0].paymentMethod}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/vehicles"
          className={`${buttonPrimary} flex-1 py-4 !bg-[#FF8A00] !text-white hover:!bg-[#e67b00]`}
        >
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>

        <Link
          href="/contact-us"
          className={`${buttonSecondary} flex-1 py-4 !border-[#0057D9] !text-[#0057D9] hover:!bg-[#0057D9]/10`}
        >
          Questions? Contact Us
        </Link>
      </div>
    </>
  );
}