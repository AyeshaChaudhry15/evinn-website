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
      <PageHeader
        title="Find A Dealer"
        description="Locate EVINN dealers and service centers near you."
      />
      <DealerFinder />

      <ul className="mt-12 grid grid-cols-1 gap-4 border-t border-slate-800/60 pt-6 md:grid-cols-3">
        {PROMISES.map(({ icon: Icon, title }) => (
          <li
            key={title}
            className="flex items-center gap-3 rounded-xl border border-slate-800/60 bg-ink-900 p-4"
          >
            <span className="rounded-lg bg-brand/10 p-2 text-brand">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-sm font-medium text-slate-300">{title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
