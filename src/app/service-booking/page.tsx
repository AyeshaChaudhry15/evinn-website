import type { Metadata } from "next";
import Image from "next/image";
import { Cog, Network, Timer, UserCog } from "lucide-react";
import { ServiceBookingForm } from "@/components/forms/service-booking-form";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { container } from "@/components/ui/styles";
import { getAllBikes } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "After Sales & Service",
  description:
    "Book a service for your electric bike or scooter with EVINN's trained EV technicians.",
};

const FEATURES = [
  { icon: Network, title: "Nationwide", subtitle: "Service Network" },
  { icon: UserCog, title: "Trained", subtitle: "EV Technicians" },
  { icon: Timer, title: "Quick", subtitle: "Turnaround Time" },
  { icon: Cog, title: "Genuine", subtitle: "Spare Parts" },
];

export default async function ServiceBookingPage() {
  const vehicles = await getAllBikes()
    .then((bikes) => [...new Set(bikes.map((bike) => bike.name))].sort())
    .catch(() => []);

  return (
    <div className={`${container} py-10 lg:py-14`}>
      <div className="[&_.page-header-title]:text-white [&_.page-header-description]:text-gray-400">
        <PageHeader
          title={
            <>
              <span className="text-[#0057D9]">After Sales</span>{" "}
              <span className="text-[#FF8A00]">&amp; Service</span>
            </>
          }
          description="We are always here to keep you moving."
        />
      </div>

      <ul className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, subtitle }, index) => (
          <Reveal
            key={title}
            as="li"
            delay={index * 0.06}
            className="flex flex-col items-center rounded-2xl border border-[#1d2b38] bg-[#0a141e] px-4 py-8 text-center transition-colors hover:border-[#FF8A00]/50"
          >
            <Icon
              className="mb-4 h-12 w-12 text-[#FF8A00]"
              strokeWidth={1.5}
              aria-hidden
            />

            <p className="text-lg text-white">
              {title}
              <br />
              {subtitle}
            </p>
          </Reveal>
        ))}
      </ul>

      <Reveal className="relative overflow-hidden rounded-2xl border border-[#1d2b38] bg-[#0a141e]">
        <Image
          src="/service.jpeg"
          alt=""
          fill
          sizes="100vw"
          className="hidden object-cover object-right sm:block"
        />

        <div className="absolute inset-0 hidden bg-linear-to-r from-[#0a141e] via-[#0a141e]/80 to-transparent sm:block" />

        <div className="relative z-10 max-w-md px-6 py-8 sm:px-10 sm:py-10">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
            <span className="text-[#0057D9]">Book a</span>{" "}
            <span className="text-[#FF8A00]">Service</span>
          </h2>

          <ServiceBookingForm vehicles={vehicles} />
        </div>
      </Reveal>
    </div>
  );
}