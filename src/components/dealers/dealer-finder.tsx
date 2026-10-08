"use client";

import { useState } from "react";
import { MapPin, Navigation, Search } from "lucide-react";
import { input } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

const DEALERS = [
  { id: "1", name: "EVINN Premium Store", location: "Lahore, Punjab" },
  { id: "2", name: "Okla Electric Experience Center", location: "Islamabad" },
  { id: "3", name: "Revoo Store", location: "Karachi" },
];

const directionsHref = (name: string, location: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${location}`)}`;

export function DealerFinder() {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const dealers = DEALERS.filter(
    (dealer) =>
      dealer.name.toLowerCase().includes(needle) ||
      dealer.location.toLowerCase().includes(needle),
  );

  return (
    <>
      <div className="relative mb-8 max-w-2xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Enter your city or area"
          aria-label="Search dealers by city or name"
          className={cn(input, "py-3.5 pl-11")}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <ul className="space-y-4" aria-live="polite">
          {dealers.length > 0 ? (
            dealers.map((dealer) => (
              <li
                key={dealer.id}
                className="rounded-2xl border border-line bg-ink-900 p-5 transition-colors hover:border-line-strong"
              >
                <h2 className="mb-1 text-base font-bold text-slate-100">
                  {dealer.name}
                </h2>
                <p className="mb-4 flex items-center gap-1.5 text-sm text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-brand" aria-hidden />
                  {dealer.location}
                </p>
                <a
                  href={directionsHref(dealer.name, dealer.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700/50 bg-ink-800 px-4 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:border-brand/50 hover:text-white"
                >
                  <Navigation className="h-3.5 w-3.5 text-brand" aria-hidden />
                  Get Directions
                </a>
              </li>
            ))
          ) : (
            <li className="text-sm text-slate-500">
              No dealers found for “{query}”.
            </li>
          )}
        </ul>

        <div className="relative h-100 w-full overflow-hidden rounded-2xl border border-line bg-ink-900 lg:h-105">
          <iframe
            title="Dealer map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d217759.99380839958!2d74.19430635174549!3d31.48310366035043!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107d9%3A0xc23add615333709f!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0 invert-90 hue-rotate-180"
          />
        </div>
      </div>
    </>
  );
}
