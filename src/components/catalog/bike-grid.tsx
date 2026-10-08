import { BikeCard } from "@/components/catalog/bike-card";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import type { Bike } from "@/types/api";

interface BikeGridProps {
  bikes: Bike[];
  className?: string;
}

export function BikeGrid({ bikes, className }: BikeGridProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {bikes.map((bike, index) => (
        <Reveal key={bike._id} as="li" delay={Math.min(index, 5) * 0.05}>
          <BikeCard bike={bike} />
        </Reveal>
      ))}
    </ul>
  );
}
