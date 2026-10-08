import type { Metadata } from "next";
import { GuideTabs } from "@/components/guides/guide-tabs";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Battery & Charging",
  description:
    "Battery care, charging best practices, charging stations and maintenance tips for electric bikes and scooters.",
};

export default function BatteryChargingPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-10">
      <PageHeader
        title="Battery & Charging"
        description="Power your ride the smart way."
      />
      <GuideTabs />
    </div>
  );
}
