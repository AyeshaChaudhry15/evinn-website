import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import { buttonPrimary } from "@/components/ui/styles";
import type { LegalDocument } from "@/data/legal";

export function LegalPage({
  document,
}: {
  document: LegalDocument;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-12 lg:py-16">
      <Reveal className="mb-10 text-center">
        <span
          className="
            mb-4 inline-block
            rounded-full
            border border-blue-500/40
            bg-blue-500/10
            px-4 py-1.5
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-blue-400
          "
        >
          {document.badge}
        </span>

        <h1
          className="
            text-3xl
            font-extrabold
            tracking-tight
            text-white
            sm:text-4xl
            lg:text-5xl
          "
        >
          {document.title}
        </h1>

        <p
          className="
            mx-auto
            mt-4
            max-w-2xl
            text-sm
            leading-7
            text-soft
            sm:text-base
          "
        >
          {document.intro}
        </p>

        <p className="mt-3 text-xs text-faint">
          Last updated: {document.lastUpdated}
        </p>
      </Reveal>

      <div
        className="
          divide-y
          divide-blue-500/10
          rounded-2xl
          border
          border-blue-500/20
          bg-[#07121d]
          px-5
          shadow-[0_15px_40px_rgba(0,0,0,0.25)]
          sm:px-8
          lg:px-10
        "
      >
        {document.sections.map((section, index) => (
          <section
            key={section.heading}
            className="py-7"
          >
            <h2
              className="
                text-xl
                font-bold
                text-white
                transition-colors
                duration-200
                hover:text-[#FF8A00]
              "
            >
              {index + 1}. {section.heading}
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-7
                text-soft
              "
            >
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className={`
            ${buttonPrimary}
            rounded-full

            !bg-[#FF8A00]
            !text-white

            transition-all
            duration-200

            hover:!bg-[#FF9F33]
            hover:!text-white

            hover:shadow-[0_8px_25px_rgba(255,138,0,0.30)]

            focus:outline-none
            focus:ring-2
            focus:ring-[#FF8A00]/50
            focus:ring-offset-2
            focus:ring-offset-[#07121d]
          `}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}