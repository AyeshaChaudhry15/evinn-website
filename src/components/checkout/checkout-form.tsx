"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ShoppingBag } from "lucide-react";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { ProductImage } from "@/components/ui/product-image";
import { buttonPrimary, input } from "@/components/ui/styles";
import { errorMessage } from "@/lib/api";
import { cart, useCart } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { formatPKR } from "@/lib/format";
import { saveCheckoutResult, type CheckoutResult } from "@/lib/last-order";
import { placeOrder } from "@/lib/submissions";
import { useHydrated } from "@/lib/use-hydrated";
import {
  hasErrors,
  isPhone,
  isPostalCode,
  type FieldErrors,
} from "@/lib/validation";
import type { Bike, PlacedOrder, ShippingAddress } from "@/types/api";

interface CheckoutLine {
  bikeId: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

const RATE_LIMIT_MESSAGE =
  "You've placed several orders already. Please try again in an hour.";

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: "",
  phoneNumber: "",
  address: "",
  city: "",
  postalCode: "",
};

function validate(values: ShippingAddress): FieldErrors<ShippingAddress> {
  return {
    fullName: values.fullName.trim() ? undefined : "Full name is required",
    phoneNumber: !values.phoneNumber.trim()
      ? "Phone number is required"
      : isPhone(values.phoneNumber)
        ? undefined
        : "Enter a valid phone number, e.g. +92 300 1234567",
    address: values.address.trim() ? undefined : "Address is required",
    city: values.city.trim() ? undefined : "City is required",
    postalCode: !values.postalCode.trim()
      ? "Postal code is required"
      : isPostalCode(values.postalCode)
        ? undefined
        : "Postal code must be 5 digits",
  };
}

const trimAddress = (values: ShippingAddress): ShippingAddress => ({
  fullName: values.fullName.trim(),
  phoneNumber: values.phoneNumber.trim(),
  address: values.address.trim(),
  city: values.city.trim(),
  postalCode: values.postalCode.trim(),
});

interface CheckoutFormProps {
  directBike?: Bike;
}

export function CheckoutForm({ directBike }: CheckoutFormProps) {
  const router = useRouter();
  const hydrated = useHydrated();
  const cartItems = useCart();
  const [directQuantity, setDirectQuantity] = useState(1);

  const [values, setValues] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [errors, setErrors] = useState<FieldErrors<ShippingAddress>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const lines: CheckoutLine[] = directBike
    ? [
        {
          bikeId: directBike._id,
          name: directBike.name,
          imageUrl: directBike.imageUrl,
          price: directBike.price,
          quantity: directQuantity,
        },
      ]
    : cartItems;

  const total = lines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );

  const onChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    setSubmitError("");

    const shippingAddress = trimAddress(values);
    const placed: {
      line: CheckoutLine;
      order: PlacedOrder;
      message: string;
    }[] = [];
    let failure: { line: CheckoutLine; reason: string } | null = null;

    for (const line of lines) {
      try {
        const { order, message } = await placeOrder({
          bike: line.bikeId,
          quantity: line.quantity,
          shippingAddress,
        });
        placed.push({ line, order, message });
      } catch (error) {
        failure = { line, reason: errorMessage(error, RATE_LIMIT_MESSAGE) };
        break;
      }
    }

    if (placed.length === 0) {
      setSubmitError(
        failure?.reason ?? "Something went wrong. Please try again.",
      );
      setSubmitting(false);
      return;
    }

    const placedIds = new Set(placed.map(({ line }) => line.bikeId));
    const failed = failure;
    const result: CheckoutResult = {
      message: placed[0].message,
      orders: placed.map(({ order }) => order),
      failed: failed
        ? lines
            .filter((line) => !placedIds.has(line.bikeId))
            .map((line) => ({
              name: line.name,
              reason:
                line.bikeId === failed.line.bikeId
                  ? failed.reason
                  : "Not submitted yet",
            }))
        : [],
    };

    saveCheckoutResult(result);
    if (!directBike) cart.remove([...placedIds]);
    router.push("/order-placed");
  };

  if (!directBike && !hydrated) {
    return (
      <div
        className="h-96 animate-pulse rounded-2xl border border-line bg-ink-900"
        aria-busy="true"
      />
    );
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-7 w-7" />}
        title="Your cart is empty"
        description="Add a vehicle to your cart before checking out."
        action={
          <Link href="/vehicles" className={buttonPrimary}>
            Browse Vehicles
          </Link>
        }
      />
    );
  }

  const fieldProps = (name: keyof ShippingAddress) => ({
    id: name,
    name,
    value: values[name],
    onChange,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    className: input,
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <h2 className="text-xl font-semibold text-white">Shipping Details</h2>

        {submitError && <Alert tone="error">{submitError}</Alert>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Full Name"
            htmlFor="fullName"
            error={errors.fullName}
            required
          >
            <input
              {...fieldProps("fullName")}
              autoComplete="name"
              maxLength={100}
              placeholder="Enter your name"
            />
          </Field>
          <Field
            label="Phone Number"
            htmlFor="phoneNumber"
            error={errors.phoneNumber}
            hint="Include the country code, e.g. +92 300 1234567"
            required
          >
            <input
              {...fieldProps("phoneNumber")}
              type="tel"
              autoComplete="tel"
              placeholder="+92 300 1234567"
            />
          </Field>
        </div>

        <Field
          label="Address"
          htmlFor="address"
          error={errors.address}
          required
        >
          <textarea
            {...fieldProps("address")}
            rows={3}
            maxLength={500}
            autoComplete="street-address"
            placeholder="House, street, area"
            className={cn(input, "resize-none")}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="City" htmlFor="city" error={errors.city} required>
            <input
              {...fieldProps("city")}
              autoComplete="address-level2"
              maxLength={100}
              placeholder="Enter your city"
            />
          </Field>
          <Field
            label="Postal Code"
            htmlFor="postalCode"
            error={errors.postalCode}
            required
          >
            <input
              {...fieldProps("postalCode")}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              placeholder="54000"
            />
          </Field>
        </div>

        <fieldset className="pt-2">
          <legend className="mb-4 text-xl font-semibold text-white">
            Payment Method
          </legend>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand/40 bg-ink-900 p-4">
              <input
                type="radio"
                name="payment"
                defaultChecked
                className="mt-1 accent-brand"
              />
              <span>
                <span className="block text-sm font-medium text-white">
                  Cash on Delivery
                </span>
                <span className="text-xs text-gray-400">
                  Pay when you receive the order
                </span>
              </span>
            </label>
            {["JazzCash / Easypaisa", "Bank Transfer"].map((method) => (
              <label
                key={method}
                className="flex cursor-not-allowed items-start gap-3 rounded-xl border border-line bg-ink-900 p-4 opacity-50"
              >
                <input type="radio" name="payment" disabled className="mt-1" />
                <span>
                  <span className="block text-sm font-medium text-white">
                    {method}
                  </span>
                  <span className="text-xs text-gray-400">
                    Currently unavailable
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={submitting}
          className={cn(buttonPrimary, "w-full py-3.5")}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Placing order…
            </>
          ) : (
            <>
              Confirm Order
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <aside className="h-fit rounded-xl border border-white/10 bg-ink-900 p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold text-white">Order Summary</h2>
        <ul className="mt-5 space-y-4">
          {lines.map((line) => (
            <li key={line.bikeId} className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
                <ProductImage
                  src={line.imageUrl}
                  alt=""
                  sizes="64px"
                  className="p-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {line.name}
                </p>
                <p className="text-xs text-gray-400">{formatPKR(line.price)}</p>
                {directBike ? (
                  <div className="mt-2">
                    <QuantityStepper
                      value={line.quantity}
                      onChange={setDirectQuantity}
                      label="Quantity"
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">
                    Qty: {line.quantity}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="font-medium text-white">Estimated total</span>
          <span className="text-lg font-semibold text-brand">
            {formatPKR(total)}
          </span>
        </div>
        <p className="mt-3 text-xs leading-5 text-faint">
          The final amount is confirmed by our team when we call you. Payment is
          collected on delivery.
        </p>
      </aside>
    </div>
  );
}
