import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";

const CATEGORIES = [
  {
    title: "Electric Bikes",
    description: "High Performance. Zero Emission.",
    cta: "Explore Bikes",
    image: "/hero3.png",
    href: "/electric-bikes",
  },
  {
    title: "Electric Scooters",
    description: "Smart, Stylish, Sustainable.",
    cta: "Explore Scooters",
    image: "/hero2.png",
    href: "/electric-scooters",
  },
];

export function Categories() {
  return (
    <section className="bg-[#06111F] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto w-full max-w-7xl">
        <Reveal>
          <h2 className="pb-6 text-3xl font-bold text-[#0057D9] sm:text-4xl">
            Shop By <span className="text-[#FF8A00]">Category</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {CATEGORIES.map((category, index) => (
            <Reveal
              key={category.title}
              delay={index * 0.1}
              className="flex flex-col overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] transition-colors hover:border-[#0057D9]/30 hover:bg-white/[0.05] lg:min-h-85 lg:flex-row"
            >
              <div className="flex flex-col items-center justify-center px-6 py-8 text-center lg:w-[48%] lg:items-start lg:px-8 lg:text-left">
                <h3 className="text-2xl font-bold text-white sm:text-3xl">
                  {category.title}
                </h3>

                <p className="mt-2 max-w-80 text-sm text-gray-400 sm:text-base">
                  {category.description}
                </p>

                <Link
                  href={category.href}
                  className="mt-6 inline-flex items-center justify-center rounded-md bg-[#FF8A00] px-6 py-3 text-sm font-semibold text-[#06111F] transition-colors hover:bg-[#FF9D2E]"
                >
                  {category.cta}
                </Link>
              </div>

              <div className="relative h-56 w-full shrink-0 sm:h-64 lg:h-auto lg:w-[52%]">
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-contain p-4"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}