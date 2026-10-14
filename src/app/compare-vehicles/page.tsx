import type { Metadata } from "next";
import { Bike as BikeIcon } from "lucide-react";
import { CompareVehicles } from "@/components/compare/compare-vehicles";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { container } from "@/components/ui/styles";
import { errorMessage } from "@/lib/api";
import { getAllBikes } from "@/lib/catalog";
import { firstParam } from "@/lib/search-params";
import type { Bike } from "@/types/api";

export const metadata: Metadata = {
  title: "Compare Vehicles",
  description:
    "Compare electric bikes and scooters side by side: price, range, top speed, battery and more.",
};

function initialSelection(bikes: Bike[], slugsParam: string | undefined) {
  const requested = (slugsParam ?? "").split(",").filter(Boolean);
  const ids = requested
    .map((slug) => bikes.find((bike) => bike.slug === slug)?._id)
    .filter((id): id is string => Boolean(id))
    .slice(0, 3);

  const target = ids.length === 0 ? 3 : 2;
  for (const bike of bikes) {
    if (ids.length >= target) break;
    if (!ids.includes(bike._id)) ids.push(bike._id);
  }
  return ids;
}

export default async function CompareVehiclesPage({
  searchParams,
}: PageProps<"/compare-vehicles">) {
  const query = await searchParams;
  const result = await getAllBikes().then(
    (bikes) => ({ bikes, error: null }),
    (error: unknown) => ({ bikes: [], error: errorMessage(error) }),
  );

  return (
    <div className={`${container} py-10 lg:py-14`}>
      <div className="[&_.page-header-title]:text-white [&_.page-header-description]:text-gray-400">
        <PageHeader
          title={
            <>
              <span className="text-[#0057D9]">Compare</span>{" "}
              <span className="text-[#FF8A00]">Vehicles</span>
            </>
          }
          description="Pick up to three electric bikes or scooters and compare them side by side."
        />
      </div>

      {result.error ? (
        <EmptyState
          tone="error"
          title="We couldn't load vehicles"
          description={result.error}
        />
      ) : result.bikes.length === 0 ? (
        <EmptyState
          icon={<BikeIcon className="h-7 w-7" />}
          title="No vehicles available"
          description="No vehicles are currently available for comparison."
        />
      ) : (
        <CompareVehicles
          key={firstParam(query.bikes) ?? ""}
          bikes={result.bikes}
          initialIds={initialSelection(
            result.bikes,
            firstParam(query.bikes),
          )}
        />
      )}
    </div>
  );
}