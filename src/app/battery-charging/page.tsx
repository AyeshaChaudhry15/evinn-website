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
      <div className="[&_.page-header-title]:text-white [&_.page-header-description]:text-gray-400">
        <PageHeader
          title={
            <>
              <span className="text-[#0057D9]">Battery</span>{" "}
              <span className="text-[#FF8A00]">&amp; Charging</span>
            </>
          }
          description="Power your ride the smart way."
        />
      </div>

      <GuideTabs />
    </div>
  );
}