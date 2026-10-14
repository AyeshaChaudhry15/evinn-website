import type { Metadata } from "next";
import { BikeCatalog } from "@/components/catalog/bike-catalog";
import { PageHeader } from "@/components/ui/page-header";
import { container } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Electric Bikes",
  description:
    "High-performance electric bikes for modern, sustainable transportation in Pakistan.",
};

export default async function ElectricBikesPage({
  searchParams,
}: PageProps<"/electric-bikes">) {
  return (
    <main className="min-h-screen w-full bg-[#06111F] text-white">
      <div className={`${container} py-10 lg:py-14`}>
        <div className="[&_.page-header-title]:text-white [&_.page-header-description]:text-gray-400">
          <PageHeader
            title={
              <>
                <span className="text-[#0057D9]">Electric</span>{" "}
                <span className="text-[#FF8A00]">Bikes</span>
              </>
            }
            description="Explore our collection of high-performance electric bikes built for modern and sustainable transportation."
          />
        </div>

        <BikeCatalog
          pathname="/electric-bikes"
          searchParams={await searchParams}
          type="bike"
          noun="bikes"
        />
      </div>
    </main>
  );
}