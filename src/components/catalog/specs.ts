import {
  Battery,
  Clock,
  Gauge,
  Route,
  ShieldCheck,
  Weight,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { BikeSpecs } from "@/types/api";

export const SPEC_FIELDS: {
  key: keyof BikeSpecs;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "range", label: "Range", icon: Route },
  { key: "topSpeed", label: "Top Speed", icon: Gauge },
  { key: "battery", label: "Battery", icon: Battery },
  { key: "chargingTime", label: "Charging Time", icon: Clock },
  { key: "motorPower", label: "Motor Power", icon: Zap },
  { key: "weight", label: "Weight", icon: Weight },
  { key: "warranty", label: "Warranty", icon: ShieldCheck },
];

export const specValue = (
  specs: Partial<BikeSpecs> | undefined,
  key: keyof BikeSpecs,
) => specs?.[key]?.trim() || "—";
