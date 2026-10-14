import type { Metadata } from "next";
import Image from "next/image";
import { Leaf, Lightbulb, Sprout, Users } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "EVINN is Pakistan's trusted electric mobility marketplace, driving the country towards a cleaner, greener future.",
};

const STATS = [
  { value: "10+", label: "Trusted Brands" },
  { value: "500+", label: "Models" },
  { value: "10K+", label: "Happy Customers" },
];

const VALUES = [
  { label: "Innovation", icon: Lightbulb },
  { label: "Sustainability", icon: Leaf },
  { label: "Customer First", icon: Users },
];

const tile =
  "rounded-xl border border-white/10 bg-[#0D1720]/90 backdrop-blur-sm";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06111F]">
      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-10 lg:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-36 top-5 z-0 h-125 w-125 opacity-40 sm:opacity-50 lg:-right-24 lg:h-162.5 lg:w-175 lg:opacity-90"
        >
          <div className="absolute inset-0 rounded-full bg-[#0057D9]/10 blur-[100px]" />

          <Image
            src="/about-globe.png"
            alt=""
            fill
            sizes="(max-width: 1024px) 500px, 700px"
            className="object-contain motion-safe:animate-[spin_18s_linear_infinite]"
          />
        </div>

        <div className="relative z-10 w-full max-w-175">
          <Reveal>
            <h1 className="flex items-center gap-2 text-[34px] font-extrabold leading-tight tracking-tight sm:text-[44px] lg:text-[52px]">
              <span className="text-white">About</span>
              <span className="text-[#0057D9]">
                EV<span className="text-[#FF8A00]">INN</span>
              </span>
            </h1>

            <p className="mt-2 text-sm text-[#0057D9] sm:text-lg">
              Driving Pakistan towards a cleaner, greener future.
            </p>

            <p className="mt-8 max-w-162.5 text-sm leading-6 text-[#B0BBC5] sm:text-base sm:leading-7 lg:text-[17px] lg:leading-8">
              EVINN is Pakistan&apos;s trusted electric mobility marketplace,
              bringing you the best electric bikes and scooters from top global
              and local brands.
            </p>
          </Reveal>

          <ul className="mt-8 grid grid-cols-3 gap-2 sm:max-w-152.5 sm:gap-3 lg:mt-10">
            {STATS.map((stat, index) => (
              <Reveal
                key={stat.label}
                as="li"
                delay={0.1 + index * 0.06}
                className={`${tile} flex min-h-20 flex-col items-center justify-center px-1 py-3 text-center transition-colors hover:border-[#0057D9]/40 sm:min-h-25`}
              >
                <span className="text-xl font-semibold text-white sm:text-[28px] lg:text-[30px]">
                  {stat.value}
                </span>

                <span className="mt-1 text-[10px] text-[#C0C8D0] sm:text-xs lg:text-[13px]">
                  {stat.label}
                </span>
              </Reveal>
            ))}
          </ul>

          <Reveal
            delay={0.2}
            className={`${tile} mt-7 flex items-center gap-4 px-5 py-5 transition-colors hover:border-[#0057D9]/40 sm:gap-5 sm:px-7`}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#FF8A00] lg:h-17 lg:w-17">
              <Sprout
                className="h-7 w-7 text-[#FF8A00] lg:h-9 lg:w-9"
                aria-hidden
              />
            </span>

            <div>
              <h2 className="text-base font-semibold text-[#0057D9] sm:text-lg lg:text-xl">
                Our <span className="text-[#FF8A00]">Mission</span>
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#B8C1CA] sm:text-sm sm:leading-6 lg:text-base lg:leading-7">
                To accelerate the world&apos;s transition to sustainable
                mobility.
              </p>
            </div>
          </Reveal>

          <ul className="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
            {VALUES.map(({ label, icon: Icon }, index) => (
              <Reveal
                key={label}
                as="li"
                delay={0.25 + index * 0.06}
                className={`${tile} flex min-h-18 items-center justify-center gap-1.5 px-1 transition-colors hover:border-[#0057D9]/40 sm:min-h-22 sm:gap-2 sm:px-2 lg:gap-3`}
              >
                <Icon
                  className="h-5 w-5 shrink-0 text-[#0057D9] sm:h-7 sm:w-7 lg:h-8 lg:w-8"
                  aria-hidden
                />

                <span className="text-xs font-medium text-[#D7DDE2] sm:text-lg lg:text-xl">
                  {label}
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
