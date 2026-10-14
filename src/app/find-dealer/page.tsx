import type { Metadata } from "next";
import { Award, Headphones, ShieldCheck } from "lucide-react";
import { DealerFinder } from "@/components/dealers/dealer-finder";
import { PageHeader } from "@/components/ui/page-header";
import { container } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Find a Dealer",
  description: "Locate EVINN dealers and service centers near you.",
};

const PROMISES = [
  { icon: Award, title: "Authorized Dealers" },
  { icon: ShieldCheck, title: "Genuine Products" },
  { icon: Headphones, title: "Expert Guidance" },
];

export default function FindDealerPage() {
  return (
    <div className={`${container} py-10 md:py-14`}>
      <div className="[&_.page-header-title]:text-white [&_.page-header-description]:text-gray-400">
        <PageHeader
          title={
            <>
              <span className="text-[#0057D9]">Find A</span>{" "}
              <span className="text-[#FF8A00]">Dealer</span>
            </>
          }
          description="Locate EVINN dealers and service centers near you."
        />
      </div>

      <DealerFinder />

      <ul className="mt-12 grid grid-cols-1 gap-4 border-t border-slate-800/60 pt-6 md:grid-cols-3">
        {PROMISES.map(({ icon: Icon, title }, index) => (
          <li
            key={title}
            className="flex items-center gap-3 rounded-xl border border-slate-800/60 bg-ink-900 p-4"
          >
            <span
              className={`rounded-lg p-2 ${
                index === 1
                  ? "bg-[#FF8A00]/10 text-[#FF8A00]"
                  : "bg-[#0057D9]/10 text-[#FF8A00]"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>

            <span className="text-sm font-medium text-slate-300">
              {title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}