"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  BadgePercent,
  Bike,
  Building2,
  Headphones,
  Wallet,
} from "lucide-react";

const STATS = [
  { icon: Building2, label: "10+ Trusted Brands" },
  { icon: Bike, label: "50+ Models" },
  { icon: BadgePercent, label: "Best Prices" },
  { icon: Wallet, label: "Easy Financing" },
  { icon: Headphones, label: "After Sales Support" },
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const enter = (delay: number, x = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, x, y: x === 0 ? 20 : 0 },
          animate: { opacity: 1, x: 0, y: 0 },
          transition: { duration: 0.6, delay, ease: "easeOut" as const },
        };

  return (
    <section className="w-full bg-ink-950 px-4 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-2 lg:grid-cols-2">
        <motion.div {...enter(0, -40)}>
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            The Future <br />
            Moves <span className="text-brand">Electric</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-gray-400 sm:text-xl">
            Explore 10+ Trusted Brands, 50+ Models. One Destination.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 lg:gap-4">
            <Link
              href="/vehicles"
              className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-brand-hover lg:px-6 lg:py-4 lg:text-base"
            >
              Explore Vehicles
            </Link>
            <Link
              href="/compare-vehicles"
              className="rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-brand hover:text-brand lg:px-6 lg:py-4 lg:text-base"
            >
              Compare Vehicles
            </Link>
          </div>
        </motion.div>

        <motion.div
          {...enter(0.15, 40)}
          className="relative mt-8 h-64 sm:h-80 md:h-88 lg:-ml-10 lg:mt-0 lg:h-100"
        >
          <Image
            src="/hero1.png"
            alt="Electric motorbike"
            fill
            preload
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain object-center lg:object-right"
          />
        </motion.div>
      </div>

      <ul className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-3 py-8 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {STATS.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/3 px-4 py-4"
          >
            <Icon className="h-7 w-7 shrink-0 text-brand" aria-hidden />
            <span className="text-base font-medium text-gray-200">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
