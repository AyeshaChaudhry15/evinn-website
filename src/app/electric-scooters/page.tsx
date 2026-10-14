import type { Metadata } from "next";
import { BikeCatalog } from "@/components/catalog/bike-catalog";
import { PageHeader } from "@/components/ui/page-header";
import { container } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Electric Scooters",
  description:
    "Smart, stylish and sustainable electric scooters for everyday city riding in Pakistan.",
};

export default async function ElectricScootersPage({
  searchParams,
}: PageProps<"/electric-scooters">) {
  return (
    <div className="min-h-screen w-full bg-[#06111F]">
      <div className={`${container} py-10 lg:py-14`}>
        <PageHeader
          title={
            <>
              <span className="text-[#0057D9]">Electric</span>{" "}
              <span className="text-[#FF8A00]">Scooters</span>
            </>
          }
          description="Smart, stylish and sustainable electric scooters for everyday city riding."
        />

        <BikeCatalog
          pathname="/electric-scooters"
          searchParams={await searchParams}
          type="scooter"
          noun="scooters"
        />
      </div>
    </div>
  );
}