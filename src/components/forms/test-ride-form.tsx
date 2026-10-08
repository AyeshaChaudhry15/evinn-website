"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { buttonPrimary, input, select } from "@/components/ui/styles";
import { apiRequest, errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { requestTestRide } from "@/lib/submissions";
import {
  hasErrors,
  isEmail,
  isPhone,
  isTime,
  type FieldErrors,
} from "@/lib/validation";
import type {
  Bike,
  BikeListResponse,
  BrandSummary,
  TestRideRequestInput,
} from "@/types/api";

const CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
];
const RATE_LIMIT_MESSAGE =
  "You've sent several requests already. Please try again later.";

type BikeOption = Pick<Bike, "_id" | "name">;

interface TestRideFormProps {
  brands: BrandSummary[];
  today: string;
  initialBrand?: string;
  initialBike?: string;
  initialBikes?: BikeOption[];
}

function validate(
  values: TestRideRequestInput,
  today: string,
): FieldErrors<TestRideRequestInput> {
  return {
    requesterName: values.requesterName.trim() ? undefined : "Name is required",
    requesterEmail: !values.requesterEmail.trim()
      ? "Email is required"
      : isEmail(values.requesterEmail)
        ? undefined
        : "Enter a valid email address",
    requesterWhatsApp: !values.requesterWhatsApp.trim()
      ? "WhatsApp number is required"
      : isPhone(values.requesterWhatsApp)
        ? undefined
        : "Enter a valid number with country code, e.g. +92 300 1234567",
    brand: values.brand ? undefined : "Select a brand",
    bike: values.bike ? undefined : "Select a bike or scooter",
    preferredCity: values.preferredCity.trim()
      ? undefined
      : "Preferred city is required",
    preferredDate: !values.preferredDate
      ? "Choose a date"
      : values.preferredDate < today
        ? "The date can't be in the past"
        : undefined,
    preferredTime: !values.preferredTime
      ? "Choose a time"
      : isTime(values.preferredTime)
        ? undefined
        : "Enter a valid time",
  };
}

export function TestRideForm({
  brands,
  today,
  initialBrand = "",
  initialBike = "",
  initialBikes = [],
}: TestRideFormProps) {
  const emptyValues: TestRideRequestInput = {
    requesterName: "",
    requesterEmail: "",
    requesterWhatsApp: "",
    brand: initialBrand,
    bike: initialBike,
    preferredCity: "",
    preferredDate: "",
    preferredTime: "",
  };

  const [values, setValues] = useState<TestRideRequestInput>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors<TestRideRequestInput>>({});
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [bikes, setBikes] = useState<BikeOption[]>(initialBikes);
  const [bikesLoading, setBikesLoading] = useState(false);
  const [bikesError, setBikesError] = useState("");
  const latestBrand = useRef(initialBrand);

  const update = (name: keyof TestRideRequestInput, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setStatus(null);
  };

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    update(event.target.name as keyof TestRideRequestInput, event.target.value);

  const onBrandChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const brand = event.target.value;
    latestBrand.current = brand;
    setValues((current) => ({ ...current, brand, bike: "" }));
    setErrors((current) => ({ ...current, brand: undefined, bike: undefined }));
    setStatus(null);
    setBikes([]);
    setBikesError("");
    if (!brand) return;

    setBikesLoading(true);
    try {
      const data = await apiRequest<BikeListResponse>("/bikes", {
        query: { brand, limit: 100 },
      });
      if (latestBrand.current === brand)
        setBikes(data.bikes.map(({ _id, name }) => ({ _id, name })));
    } catch (error) {
      if (latestBrand.current === brand) setBikesError(errorMessage(error));
    } finally {
      if (latestBrand.current === brand) setBikesLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate(values, today);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    setStatus(null);

    try {
      const { message } = await requestTestRide({
        ...values,
        requesterName: values.requesterName.trim(),
        requesterEmail: values.requesterEmail.trim(),
        requesterWhatsApp: values.requesterWhatsApp.trim(),
        preferredCity: values.preferredCity.trim(),
      });
      setStatus({ tone: "success", text: message });
      setValues({ ...emptyValues, brand: values.brand, bike: values.bike });
    } catch (error) {
      setStatus({
        tone: "error",
        text: errorMessage(error, RATE_LIMIT_MESSAGE),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const a11y = (name: keyof TestRideRequestInput) => ({
    id: `ride-${name}`,
    name,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `ride-${name}-error` : undefined,
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <Field
        label="Full Name"
        htmlFor="ride-requesterName"
        error={errors.requesterName}
        required
      >
        <input
          {...a11y("requesterName")}
          value={values.requesterName}
          onChange={onChange}
          autoComplete="name"
          maxLength={100}
          placeholder="Enter your name"
          className={input}
        />
      </Field>

      <Field
        label="Email Address"
        htmlFor="ride-requesterEmail"
        error={errors.requesterEmail}
        required
      >
        <input
          {...a11y("requesterEmail")}
          type="email"
          value={values.requesterEmail}
          onChange={onChange}
          autoComplete="email"
          maxLength={254}
          placeholder="you@example.com"
          className={input}
        />
      </Field>

      <Field
        label="WhatsApp Number"
        htmlFor="ride-requesterWhatsApp"
        error={errors.requesterWhatsApp}
        hint="With country code so we can message you"
        required
      >
        <input
          {...a11y("requesterWhatsApp")}
          type="tel"
          value={values.requesterWhatsApp}
          onChange={onChange}
          autoComplete="tel"
          placeholder="+92 300 1234567"
          className={input}
        />
      </Field>

      <Field
        label="Preferred City"
        htmlFor="ride-preferredCity"
        error={errors.preferredCity}
        required
      >
        <input
          {...a11y("preferredCity")}
          list="ride-cities"
          value={values.preferredCity}
          onChange={onChange}
          autoComplete="address-level2"
          maxLength={100}
          placeholder="e.g. Lahore"
          className={input}
        />
        <datalist id="ride-cities">
          {CITIES.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </Field>

      <Field label="Brand" htmlFor="ride-brand" error={errors.brand} required>
        <div className="relative">
          <select
            {...a11y("brand")}
            value={values.brand}
            onChange={onBrandChange}
            className={select}
          >
            <option value="">Select a brand</option>
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.displayName}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        </div>
      </Field>

      <Field
        label="Bike / Scooter"
        htmlFor="ride-bike"
        error={errors.bike || bikesError}
        hint={
          values.brand && !bikesLoading && bikes.length === 0 && !bikesError
            ? "No models listed for this brand yet."
            : undefined
        }
        required
      >
        <div className="relative">
          <select
            {...a11y("bike")}
            value={values.bike}
            onChange={onChange}
            disabled={!values.brand || bikesLoading || bikes.length === 0}
            className={select}
          >
            <option value="">
              {!values.brand
                ? "Select a brand first"
                : bikesLoading
                  ? "Loading models…"
                  : "Select a model"}
            </option>
            {bikes.map((bike) => (
              <option key={bike._id} value={bike._id}>
                {bike.name}
              </option>
            ))}
          </select>
          {bikesLoading ? (
            <Loader2 className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted" />
          ) : (
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          )}
        </div>
      </Field>

      <Field
        label="Preferred Date"
        htmlFor="ride-preferredDate"
        error={errors.preferredDate}
        required
      >
        <input
          {...a11y("preferredDate")}
          type="date"
          min={today}
          value={values.preferredDate}
          onChange={onChange}
          className={input}
        />
      </Field>

      <Field
        label="Preferred Time"
        htmlFor="ride-preferredTime"
        error={errors.preferredTime}
        required
      >
        <input
          {...a11y("preferredTime")}
          type="time"
          value={values.preferredTime}
          onChange={onChange}
          className={input}
        />
      </Field>

      {status && (
        <Alert tone={status.tone} className="sm:col-span-2">
          {status.text}
        </Alert>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={cn(buttonPrimary, "mt-2 w-full py-3.5 sm:col-span-2")}
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Submitting…" : "Submit Request"}
      </button>
    </form>
  );
}
