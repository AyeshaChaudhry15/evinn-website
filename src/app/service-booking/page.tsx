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
      <PageHeader
        title="After Sales & Service"
        description="We are always here to keep you moving."
      />

      <ul className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, subtitle }, index) => (
          <Reveal
            key={title}
            as="li"
            delay={index * 0.06}
            className="flex flex-col items-center rounded-2xl border border-white/10 bg-ink-900 px-4 py-8 text-center"
          >
            <Icon
              className="mb-4 h-12 w-12 text-brand"
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

      <Reveal className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
        <Image
          src="/service.jpeg"
          alt=""
          fill
          sizes="100vw"
          className="hidden object-cover object-right sm:block"
        />
        <div className="absolute inset-0 hidden bg-linear-to-r from-ink-900 via-ink-900/80 to-transparent sm:block" />

        <div className="relative z-10 max-w-md px-6 py-8 sm:px-10 sm:py-10">
          <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
            Book a Service
          </h2>
          <ServiceBookingForm vehicles={vehicles} />
        </div>
      </Reveal>
    </div>
  );
}
