"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

interface FaqAccordionProps {
  items: readonly { question: string; answer: string }[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <ul className="space-y-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <li
            key={item.question}
            className={cn(
              "overflow-hidden rounded-xl border border-[#293746] bg-[#0b151f]/95 transition-shadow",
              isOpen && "shadow-lg shadow-black/20",
            )}
          >
            <h2>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5 sm:py-5"
              >
                <span className="text-sm font-medium text-[#f1f4f7] sm:text-base">
                  {item.question}
                </span>
                <Plus
                  className={cn(
                    "h-5 w-5 shrink-0 text-gray-300 transition-transform duration-200",
                    isOpen && "rotate-45",
                  )}
                  aria-hidden
                />
              </button>
            </h2>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="border-t border-[#293746] px-4 pt-4 pb-5 text-sm leading-6 text-gray-400 sm:px-5">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
