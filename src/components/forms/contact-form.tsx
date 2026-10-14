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
import {
  CONTACT_REASONS,
  type ContactFormInput,
  type ContactReason,
} from "@/types/api";

type ContactValues = Required<ContactFormInput>;

interface ContactFormProps {
  initialReason?: ContactReason;
  initialMessage?: string;
}

const RATE_LIMIT_MESSAGE =
  "You've sent several messages already. Please try again later.";

function validate(values: ContactValues): FieldErrors<ContactValues> {
  return {
    fullName: values.fullName.trim() ? undefined : "Name is required",
    email: !values.email.trim()
      ? "Email is required"
      : isEmail(values.email)
        ? undefined
        : "Please enter a valid email address",
    message: values.message.trim() ? undefined : "Please write a short message",
  };
}

export function ContactForm({
  initialReason = "General Inquiry",
  initialMessage = "",
}: ContactFormProps) {
  const emptyValues: ContactValues = {
    fullName: "",
    email: "",
    reason: initialReason,
    message: "",
  };

  const [values, setValues] = useState<ContactValues>({
    ...emptyValues,
    message: initialMessage,
  });

  const [errors, setErrors] = useState<FieldErrors<ContactValues>>({});
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

    try {
      const { message } = await submitContactForm({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        reason: values.reason,
        message: values.message.trim(),
      });

      setStatus({ tone: "success", text: message });
      setValues(emptyValues);
    } catch (error) {
      setStatus({
        tone: "error",
        text: errorMessage(error, RATE_LIMIT_MESSAGE),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const describedBy = (name: keyof ContactValues) =>
    errors[name] ? `contact-${name}-error` : undefined;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field
        label="Your Name"
        htmlFor="contact-fullName"
        error={errors.fullName}
        required
      >
        <input
          id="contact-fullName"
          name="fullName"
          value={values.fullName}
          onChange={onChange}
          autoComplete="name"
          maxLength={100}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={describedBy("fullName")}
          className={cn(
            input,
            "border-[#1d2b38] bg-[#0a141e] text-white placeholder:text-gray-500 focus:border-[#0057D9] focus:ring-[#0057D9]/30",
          )}
        />
      </Field>

      <Field
        label="Your Email"
        htmlFor="contact-email"
        error={errors.email}
        required
      >
        <input
          id="contact-email"
          name="email"
          type="email"
          value={values.email}
          onChange={onChange}
          autoComplete="email"
          maxLength={254}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={describedBy("email")}
          className={cn(
            input,
            "border-[#1d2b38] bg-[#0a141e] text-white placeholder:text-gray-500 focus:border-[#0057D9] focus:ring-[#0057D9]/30",
          )}
        />
      </Field>

      <Field label="Reason" htmlFor="contact-reason" required>
        <div className="relative">
          <select
            id="contact-reason"
            name="reason"
            value={values.reason}
            onChange={onChange}
            className={cn(
              select,
              "border-[#1d2b38] bg-[#0a141e] text-white focus:border-[#0057D9] focus:ring-[#0057D9]/30",
            )}
          >
            {CONTACT_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FF8A00]" />
        </div>
      </Field>

      <Field
        label="Your Message"
        htmlFor="contact-message"
        error={errors.message}
        required
      >
        <textarea
          id="contact-message"
          name="message"
          value={values.message}
          onChange={onChange}
          rows={5}
          maxLength={5000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("message")}
          className={cn(
            input,
            "resize-none border-[#1d2b38] bg-[#0a141e] text-white placeholder:text-gray-500 focus:border-[#0057D9] focus:ring-[#0057D9]/30",
          )}
        />
      </Field>

      {status && <Alert tone={status.tone}>{status.text}</Alert>}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          buttonPrimary,
          "w-full !bg-[#FF8A00] text-white hover:!bg-[#e67b00] disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}