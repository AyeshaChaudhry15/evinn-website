"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductImage } from "@/components/ui/product-image";
import { buttonPrimary } from "@/components/ui/styles";
import { cart, MAX_QUANTITY, useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";

export function CartView() {
  const hydrated = useHydrated();
  const items = useCart();

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
          Your Cart{hydrated && ` (${totalItems})`}
        </h1>
        <Link
          href="/vehicles"
          className="flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      {!hydrated ? (
        <div
          className="h-72 animate-pulse rounded-2xl border border-line bg-ink-900"
          aria-busy="true"
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" />}
          title="Your cart is empty"
          description="Looks like you haven't added any vehicles yet."
          action={
            <Link href="/vehicles" className={buttonPrimary}>
              Start Shopping
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.bikeId}
                className="rounded-xl border border-white/10 bg-ink-900 p-4"
              >
                <div className="flex gap-4">
                  <Link
                    href={`/bikes/${item.slug}`}
                    className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-white"
                    tabIndex={-1}
                    aria-hidden
                  >
                    <ProductImage
                      src={item.imageUrl}
                      alt=""
                      sizes="112px"
                      className="p-2"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/bikes/${item.slug}`}
                          className="font-medium text-white hover:text-brand"
                        >
                          {item.name}
                        </Link>
                        {item.brandName && (
                          <p className="mt-1 text-xs text-faint">
                            {item.brandName}
                          </p>
                        )}
                        <p className="mt-2 text-sm text-gray-300">
                          {formatPKR(item.price)}
                        </p>
                      </div>
                      <p className="hidden text-sm font-medium text-gray-300 sm:block">
                        {formatPKR(item.price * item.quantity)}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(quantity) =>
                            cart.setQuantity(item.bikeId, quantity)
                          }
                          label={`Quantity of ${item.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => cart.remove(item.bikeId)}
                          aria-label={`Remove ${item.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-gray-300 sm:hidden">
                        {formatPKR(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-xl border border-white/10 bg-ink-900 p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-white">Order Summary</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-gray-400">Subtotal</dt>
                <dd className="font-medium text-gray-200">
                  {formatPKR(subtotal)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <dt className="text-gray-400">Payment</dt>
                <dd className="font-medium text-brand">Cash on Delivery</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-base font-medium text-white">Total</dt>
                <dd className="text-xl font-semibold text-white">
                  {formatPKR(subtotal)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-5 text-faint">
              Each vehicle is placed as its own order (up to {MAX_QUANTITY}{" "}
              units each) at its current price. We&apos;ll call you to confirm
              before delivery.
            </p>
            <Link
              href="/checkout"
              className={`${buttonPrimary} mt-6 w-full py-3.5`}
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}
