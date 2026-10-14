import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BatteryCharging, Check, Settings, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { container } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Warranty Information",
  description:
    "Vehicle and battery warranty coverage for electric bikes and scooters bought through EVINN.",
};

const WARRANTY_CARDS = [
  { icon: ShieldCheck, title: "Vehicle Warranty", subtitle: "Up to 3 Years" },
  {
    icon: BatteryCharging,
    title: "Battery Warranty",
    subtitle: "Up to 5 Years",
  },
  { icon: Settings, title: "Service Support", subtitle: "Across Pakistan" },
];

const COVERED_ITEMS = [
  "Battery & Motor",
  "Manufacturing Defects",
  "Controller & Electronics",
  "Software Updates",
  "Charging System",
  "Genuine Parts Replacement",
];

export default function WarrantyPage() {
  return (
    <div className={`${container} py-10 sm:py-14 md:py-20`}>
      <div className="[&_.page-header-title]:text-white [&_.page-header-description]:text-gray-400">
        <PageHeader
          title={
            <>
              <span className="text-[#0057D9]">Warranty</span>{" "}
              <span className="text-[#FF8A00]">Information</span>
            </>
          }
          description="Ride with confidence. We've got you covered."
        />
      </div>

      <ul className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {WARRANTY_CARDS.map(({ icon: Icon, title, subtitle }, index) => (
          <Reveal
            key={title}
            as="li"
            delay={index * 0.08}
            className="flex flex-col items-center rounded-2xl border border-[#1d2b38] bg-[#0a141e] px-6 py-10 text-center transition-colors hover:border-[#FF8A00]/50"
          >
            <Icon
              className="mb-4 h-14 w-14 text-[#FF8A00]"
              strokeWidth={1.5}
              aria-hidden
            />

            <p className="text-xl font-semibold text-white">
              {title}
            </p>

            <p className="mt-1 text-sm text-[#0057D]">
              {subtitle}
            </p>
          </Reveal>
        ))}
      </ul>

      <Reveal className="relative overflow-hidden rounded-2xl border border-[#1d2b38] bg-[#0a141e]">
        <div className="relative h-48 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-56 md:w-80 lg:w-md">
          <Image
            src="/hero1.png"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 28rem"
            className="object-contain"
          />
        </div>

        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 md:max-w-xl">
          <h2 className="mb-6 text-2xl font-bold sm:text-3xl">
            <span className="text-[#0057D9]">What's</span>{" "}
            <span className="text-[#FF8A00]">Covered?</span>
          </h2>

          <ul className="mb-8 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {COVERED_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <Check
                  className="h-5 w-5 shrink-0 text-[#FF8A00]"
                  strokeWidth={3}
                  aria-hidden
                />

                <span className="text-base text-gray-200 sm:text-lg">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/check-warranty"
            className="inline-flex w-full justify-center rounded-full bg-[#FF8A00] px-6 py-2.5 text-base font-semibold text-[#06111F] transition-colors hover:bg-[#FF9D2E] sm:w-auto"
          >
            Check Warranty for Your Model
          </Link>
        </div>
      </Reveal>
    </div>
  );
}