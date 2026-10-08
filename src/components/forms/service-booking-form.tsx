"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { buttonPrimary, input, select } from "@/components/ui/styles";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { submitContactForm } from "@/lib/submissions";
import { hasErrors, isEmail, type FieldErrors } from "@/lib/validation";

const CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Faisalabad",
  "Rawalpindi",
  "Multan",
  "Peshawar",
];
const OTHER_VEHICLE = "Other";

interface ServiceValues {
  fullName: string;
  email: string;
  vehicle: string;
  city: string;
  notes: string;
}

function validate(values: ServiceValues): FieldErrors<ServiceValues> {
  return {
    fullName: values.fullName.trim() ? undefined : "Name is required",
    email: !values.email.trim()
      ? "Email is required"
      : isEmail(values.email)
        ? undefined
        : "Enter a valid email address",
    vehicle: values.vehicle ? undefined : "Select your vehicle",
  };
}

export function ServiceBookingForm({ vehicles }: { vehicles: string[] }) {
  const emptyValues: ServiceValues = {
    fullName: "",
    email: "",
    vehicle: "",
    city: CITIES[0],
    notes: "",
  };
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState<FieldErrors<ServiceValues>>({});
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setStatus(null);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    setStatus(null);

    const message = [
      "Service booking request",
      `Vehicle: ${values.vehicle}`,
      `City: ${values.city}`,
      values.notes.trim() && `Notes: ${values.notes.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await submitContactForm({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        reason: "Support",
        message,
      });
      setStatus({
        tone: "success",
        text: "Thanks! Our service team will contact you to confirm a time.",
      });
      setValues(emptyValues);
    } catch (error) {
      setStatus({
        tone: "error",
        text: errorMessage(
          error,
          "You've sent several requests already. Please try again later.",
        ),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const a11y = (name: keyof ServiceValues) => ({
    id: `service-${name}`,
    name,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `service-${name}-error` : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field
        label="Full Name"
        htmlFor="service-fullName"
        error={errors.fullName}
        required
      >
        <input
          {...a11y("fullName")}
          value={values.fullName}
          onChange={onChange}
          autoComplete="name"
          maxLength={100}
          className={input}
        />
      </Field>

      <Field
        label="Email"
        htmlFor="service-email"
        error={errors.email}
        required
      >
        <input
          {...a11y("email")}
          type="email"
          value={values.email}
          onChange={onChange}
          autoComplete="email"
          maxLength={254}
          className={input}
        />
      </Field>

      <Field
        label="Select Vehicle"
        htmlFor="service-vehicle"
        error={errors.vehicle}
        required
      >
        <div className="relative">
          <select
            {...a11y("vehicle")}
            value={values.vehicle}
            onChange={onChange}
            className={select}
          >
            <option value="">Choose your vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle} value={vehicle}>
                {vehicle}
              </option>
            ))}
            <option value={OTHER_VEHICLE}>Other / not listed</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        </div>
      </Field>

      <Field label="City" htmlFor="service-city" required>
        <div className="relative">
          <select
            {...a11y("city")}
            value={values.city}
            onChange={onChange}
            className={select}
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        </div>
      </Field>

      <Field label="What does your vehicle need?" htmlFor="service-notes">
        <textarea
          {...a11y("notes")}
          rows={3}
          value={values.notes}
          onChange={onChange}
          maxLength={2000}
          placeholder="e.g. routine service, brake check, battery issue"
          className={cn(input, "resize-none")}
        />
      </Field>

      {status && <Alert tone={status.tone}>{status.text}</Alert>}

      <button
        type="submit"
        disabled={submitting}
        className={cn(buttonPrimary, "w-full rounded-2xl py-3.5")}
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Sending…" : "Book a Service"}
      </button>
    </form>
  );
}
