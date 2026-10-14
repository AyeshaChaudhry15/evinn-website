"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { GUIDES } from "@/data/guides";
import { cn } from "@/lib/cn";

export function GuideTabs() {
  const [activeId, setActiveId] = useState(GUIDES[0].id);
  const [expanded, setExpanded] = useState(false);
  const guide = GUIDES.find((item) => item.id === activeId) ?? GUIDES[0];

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[290px_1fr]">
        <div
          role="tablist"
          aria-label="Guides"
          className="overflow-hidden rounded-xl border border-[#263541] bg-[#0b151e]"
        >
          {GUIDES.map((item) => {
            const active = item.id === activeId;

            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="guide-panel"
                onClick={() => {
                  setActiveId(item.id);
                  setExpanded(false);
                }}
                className={cn(
                  "flex h-14 w-full items-center border-b border-[#263541] px-6 text-left text-sm transition-colors last:border-b-0 sm:text-base",
                  active
                    ? "border-l-[3px] border-l-[#FF8A00] bg-[#101b24] font-medium text-[#FF8A00]"
                    : "text-[#d3d9de] hover:bg-[#101b24] hover:text-[#0057D9]",
                )}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        <motion.div
          key={guide.id}
          id="guide-panel"
          role="tabpanel"
          aria-labelledby={`tab-${guide.id}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="relative min-h-64 overflow-hidden rounded-xl border border-[#263541] bg-[#0b151e]"
        >
          <div className="relative z-10 max-w-130 px-6 py-7 sm:px-8 sm:py-8">
            <h2 className="text-2xl font-semibold text-[#0057D9] sm:text-3xl">
              {guide.name}
            </h2>

            <p className="mt-3 max-w-117.5 text-sm leading-6 text-[#aeb8c2] sm:text-base sm:leading-7">
              {guide.description}
            </p>

            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              aria-controls="guide-details"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#FF8A00] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-[#e67a00]"
            >
              {expanded ? "Show Less" : "Learn More"}

              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  expanded && "rotate-180",
                )}
              />
            </button>
          </div>

          <div className="absolute -right-5 top-1/2 hidden h-56 w-107.5 -translate-y-1/2 sm:block">
            <Image
              src={guide.image}
              alt=""
              fill
              sizes="430px"
              className="object-contain"
            />
          </div>
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.section
            id="guide-details"
            key={guide.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-xl border border-[#263541] bg-[#0b151e] p-6 sm:p-10">
              <h3 className="mb-2 text-2xl font-bold text-[#0057D9] sm:text-3xl">
                {guide.heading}
              </h3>

              <p className="mb-8 text-sm text-[#aeb8c2] sm:text-base">
                {guide.subheading}
              </p>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {guide.sections.map((section) => (
                  <div
                    key={section.title}
                    className="rounded-lg border border-[#263541] bg-[#101b24] p-5"
                  >
                    <h4 className="mb-2 text-lg font-semibold text-[#FF8A00]">
                      {section.title}
                    </h4>

                    <p className="text-sm leading-relaxed text-[#c1cbd3]">
                      {section.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {guide.features.map(({ label, icon: Icon }) => (
          <li
            key={label}
            className="flex min-h-28 flex-col items-center justify-center rounded-xl border border-[#263541] bg-[#0b151e] px-3 py-5 text-center transition-colors hover:border-[#FF8A00]/60"
          >
            <Icon
              className="mb-3 h-8 w-8 text-[#FF8A00]"
              aria-hidden
            />

            <span className="text-xs font-medium text-[#d8dee3] sm:text-[15px]">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}