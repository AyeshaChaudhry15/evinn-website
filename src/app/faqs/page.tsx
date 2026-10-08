import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { PageHeader } from "@/components/ui/page-header";
import { FAQS } from "@/data/faqs";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about electric bikes, charging, test rides, financing and service.",
};

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: "Transparent Information" },
  { icon: MessageCircle, label: "Trusted Guidance" },
  { icon: MapPin, label: "Better Buying Experience" },
];

export default function FaqsPage() {
  return (
    <div className="mx-auto w-full max-w-275 px-4 py-10 sm:px-6 sm:py-14 md:py-16">
      <PageHeader
        title="Frequently Asked Questions"
        description="Find answers to common questions."
      />

      <div className="grid grid-cols-1 items-center md:grid-cols-[60%_40%]">
        <div className="w-full max-w-175">
          <FaqAccordion items={FAQS} />
          <p className="mt-6 text-sm text-gray-400">
            Still have a question?{" "}
            <Link
              href="/contact-us"
              className="font-semibold text-brand hover:underline"
            >
              Contact us
            </Link>
            .
          </p>
        </div>

        <div
          aria-hidden
          className="hidden select-none items-center justify-center text-[300px] leading-none font-bold text-[#6fae32] opacity-50 drop-shadow-[0_0_65px_#6fae32] md:flex lg:text-[400px]"
        >
          ?
        </div>
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-5 rounded-xl border border-[#1d2b38] bg-[#0a141e] px-6 py-7 sm:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#72b82e]">
              <Icon className="h-5 w-5 text-[#72b82e]" aria-hidden />
            </span>
            <span className="text-sm text-gray-300">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
