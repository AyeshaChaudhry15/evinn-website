import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { buttonPrimary } from "@/components/ui/styles";
import type { LegalDocument } from "@/data/legal";

export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-12 lg:py-16">
      <Reveal className="mb-10 text-center">
        <span className="mb-4 inline-block rounded-full border border-[#2f5c3a] bg-[#0e1f14] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand">
          {document.badge}
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {document.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-soft sm:text-base">
          {document.intro}
        </p>
        <p className="mt-3 text-xs text-faint">
          Last updated: {document.lastUpdated}
        </p>
      </Reveal>

      <div className="divide-y divide-[#1c2830] rounded-2xl border border-line bg-ink-900 px-5 sm:px-8 lg:px-10">
        {document.sections.map((section, index) => (
          <section key={section.heading} className="py-7">
            <h2 className="text-xl font-bold text-white">
              {index + 1}. {section.heading}
            </h2>
            <p className="mt-3 text-sm leading-7 text-soft">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className={`${buttonPrimary} rounded-full`}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
