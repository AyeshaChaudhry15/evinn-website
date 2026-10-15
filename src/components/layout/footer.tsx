import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Headphones, ShieldCheck, Truck } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { getBrands } from "@/lib/catalog";
import { SITE } from "@/data/site";
import type { Brand } from "@/types/api";

const SHOP_LINKS = [
  { label: "All Vehicles", href: "/vehicles" },
  { label: "Electric Bikes", href: "/electric-bikes" },
  { label: "Electric Scooters", href: "/electric-scooters" },
  { label: "All Brands", href: "/brands" },
  { label: "Compare Vehicles", href: "/compare-vehicles" },
  { label: "Book a Test Ride", href: "/book-test-ride" },
];

const SERVICE_LINKS = [
  { label: "Find a Dealer", href: "/find-dealer" },
  { label: "Warranty Information", href: "/warranty" },
  { label: "Battery & Charging", href: "/battery-charging" },
  { label: "Accessories", href: "/accessories" },
  { label: "Spare Parts", href: "/spare-parts" },
  { label: "Service Booking", href: "/service-booking" },
];

const INFO_LINKS = [
  { label: "FAQs", href: "/faqs" },
  { label: "Blog / News", href: "/blog" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const SOCIAL_LINKS = [
  { icon: FaFacebookF, href: SITE.social.facebook, label: "Facebook" },
  { icon: FaInstagram, href: SITE.social.instagram, label: "Instagram" },
  { icon: FaLinkedinIn, href: SITE.social.linkedin, label: "LinkedIn" },
  { icon: FaXTwitter, href: SITE.social.x, label: "X" },
];

const BADGES = [
  { icon: ShieldCheck, title: "Cash on Delivery", sub: "Pay when it arrives" },
  { icon: Truck, title: "Nationwide Delivery", sub: "Across Pakistan" },
  { icon: BadgeCheck, title: "Authorized Dealers", sub: "Genuine Products" },
  { icon: Headphones, title: "Dedicated Support", sub: "We're Here to Help" },
];

async function loadBrands(): Promise<Brand[]> {
  try {
    return await getBrands();
  } catch {
    return [];
  }
}

export async function Footer() {
  const brands = (await loadBrands()).slice(0, 6);

  return (
    <footer className="w-full bg-coal text-gray-400">
      <div className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 pb-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 xl:gap-8">
          <div className="sm:col-span-2 lg:col-span-4 xl:col-span-2">
            <Link
              href="/"
              className="relative flex h-12 w-36 items-center"
              aria-label="EVINN home"
            >
              <Image
                src="/evinn-logo.png"
                alt="EVINN"
                width={150}
                height={52}
                priority
                className="h-auto max-h-12 w-auto object-contain object-left"
              />
            </Link>

            <p className="mt-1 mb-3 text-xs font-semibold uppercase tracking-wider text-[#0057D9]">
              {SITE.tagline}
            </p>

            <p className="mb-5 max-w-sm text-sm leading-6">
              Pakistan&apos;s trusted platform for electric bikes and scooters.
              Discover, compare, and choose the future of mobility.
            </p>

            <ul className="flex gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gray-300 transition-colors hover:border-[#0057D9]/50 hover:text-[#0057D9]"
                  >
                    <Icon aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn title="Shop" links={SHOP_LINKS} />

          <FooterColumn title="Services" links={SERVICE_LINKS} />

          <FooterColumn title="Information" links={INFO_LINKS} />

          {brands.length > 0 && (
            <FooterColumn
              title="Popular Brands"
              links={brands.map((brand) => ({
                label: brand.displayName,
                href: `/brands/${brand._id}`,
              }))}
            />
          )}
        </div>

        <ul className="grid grid-cols-2 gap-3 border-t border-white/10 py-6 lg:grid-cols-4">
          {BADGES.map(({ icon: Icon, title, sub }) => (
            <li
              key={title}
              className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-3"
            >
              <Icon className="h-5 w-5 shrink-0 text-[#0057D9]" aria-hidden />

              <span className="text-xs">
                <span className="block font-medium text-gray-300">{title}</span>
                {sub}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 border-t border-white/10 py-5 text-center text-xs sm:text-sm lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <p className="flex items-center justify-center gap-2 lg:justify-start">
            © {new Date().getFullYear()}{" "}
            <span className="inline-flex h-7 w-20 items-center">
              <Image
                src="/evinn-logo.png"
                alt="EVINN"
                width={100}
                height={35}
                className="h-auto max-h-7 w-auto object-contain"
              />
            </span>
            . All Rights Reserved.
          </p>

          <p>
            <a href={`mailto:${SITE.email}`} className="hover:text-[#0057D9]">
              {SITE.email}
            </a>

            <span className="mx-2">·</span>

            {SITE.address}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#0057D9]">
        {title}
      </h2>

      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm transition-colors hover:text-[#0057D9]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
