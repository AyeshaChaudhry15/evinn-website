import {
  BatteryCharging,
  BatteryFull,
  Clock,
  Gauge,
  MapPin,
  Navigation,
  Plug,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Thermometer,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface Guide {
  id: string;
  name: string;
  description: string;
  image: string;
  features: { label: string; icon: LucideIcon }[];
  heading: string;
  subheading: string;
  sections: { title: string; text: string }[];
}

export const GUIDES: Guide[] = [
  {
    id: "battery-guide",
    name: "Battery Guide",
    description: "Learn about battery health, care tips and ways to extend battery life.",
    image: "/battery-guide.png",
    features: [
      { label: "Long Battery Life", icon: BatteryFull },
      { label: "Fast Charging", icon: BatteryCharging },
      { label: "Smart BMS", icon: Settings },
      { label: "Safe & Reliable", icon: Sun },
    ],
    heading: "Complete EV Battery Care & Health Guide",
    subheading: "Maximize your vehicle's lifespan with proper battery maintenance techniques.",
    sections: [
      {
        title: "Ideal State of Charge (SoC)",
        text: "Try to keep your battery level between 20% and 80% for daily commuting. Avoid letting it drop to 0% frequently.",
      },
      {
        title: "Temperature Management",
        text: "Avoid charging your electric bike or scooter in direct sunlight during hot summer days. Let the battery cool down for 15-20 minutes after a long ride before plugging it in.",
      },
      {
        title: "Storage Precautions",
        text: "If storing your vehicle for more than two weeks, keep the battery charged to around 50-60% and store it in a cool, dry environment.",
      },
    ],
  },
  {
    id: "charging-guide",
    name: "Charging Guide",
    description: "Discover best charging practices, safety protocols, and how to maximize charging efficiency.",
    image: "/charging-guide.png",
    features: [
      { label: "Optimal Charging", icon: Zap },
      { label: "Quick Charge Support", icon: Clock },
      { label: "Overcharge Protection", icon: ShieldCheck },
      { label: "Safe Plug-in Tips", icon: Plug },
    ],
    heading: "Electric Vehicle Charging Protocols & Best Practices",
    subheading: "Safe and efficient ways to power up your EV without degrading the battery.",
    sections: [
      {
        title: "Use OEM Chargers Only",
        text: "Always use the original charger provided by the manufacturer. Unapproved chargers can cause voltage spikes and damage internal BMS circuits.",
      },
      {
        title: "Sequence Matters",
        text: "First connect the charger plug to your vehicle's port, then switch on the wall socket power to avoid initial sparking.",
      },
      {
        title: "Avoid Night Overcharging",
        text: "While modern BMS units have auto cut-off, it is recommended not to leave the charger plugged in overnight unattended.",
      },
    ],
  },
  {
    id: "charging-stations",
    name: "Charging Stations",
    description: "Locate fast EV charging stations near you and plan your routes seamlessly.",
    image: "/charging-station.png",
    features: [
      { label: "Nearby Locators", icon: MapPin },
      { label: "Route Planner", icon: Navigation },
      { label: "Fast DC Hubs", icon: Zap },
      { label: "24/7 Availability", icon: Sparkles },
    ],
    heading: "Public Charging Network & Fast Station Guide",
    subheading: "Find, connect, and charge your vehicle on the go effortlessly.",
    sections: [
      {
        title: "AC vs DC Fast Charging",
        text: "AC chargers are great for destination charging (workplaces, malls), while DC Fast Chargers give you 80% charge in under 45 minutes on highways.",
      },
      {
        title: "Station Etiquette",
        text: "Move your vehicle promptly once charging reaches 80-90% to allow other waiting EV riders to use the charger.",
      },
      {
        title: "Payment & Mobile Apps",
        text: "Use RFID cards or dedicated mobile apps to locate live available slots and make cashless automatic payments.",
      },
    ],
  },
  {
    id: "maintenance-tips",
    name: "Maintenance Tips",
    description: "Essential maintenance steps to keep your EV running smoothly and safely.",
    image: "/maintainance.png",
    features: [
      { label: "Regular Checkups", icon: Wrench },
      { label: "Tyre Pressure", icon: Gauge },
      { label: "Brake & Motor Care", icon: ShieldCheck },
      { label: "Weather Protection", icon: Thermometer },
    ],
    heading: "Comprehensive EV Preventive Maintenance Guide",
    subheading: "Keep your brakes, tires, motor, and electronics in top condition.",
    sections: [
      {
        title: "Tyre Pressure Check",
        text: "Correct tyre pressure improves overall vehicle range by 10-15%. Check tyre pressure weekly before long rides.",
      },
      {
        title: "Brake Maintenance",
        text: "Electric two-wheelers rely heavily on Regenerative Braking. Ensure brake pads are inspected every 3,000 km to prevent rotor wear.",
      },
      {
        title: "Water & Rain Safety",
        text: "While motors and controllers are IP67 water-resistant, avoid riding through deep water bodies where battery connectors might get submerged.",
      },
    ],
  },
];
