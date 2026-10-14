import type { Metadata } from "next";
import {
  Headphones,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { ContactForm } from "@/components/forms/contact-form";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { SITE, telHref, whatsappHref } from "@/data/site";
import { firstParam } from "@/lib/search-params";
import { CONTACT_REASONS, type ContactReason } from "@/types/api";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with EVINN about vehicles, orders, service or business enquiries.",
};

const CHANNELS = [
  {
    icon: Phone,
    title: "Call Us",
    value: SITE.phone,
    href: telHref,
  },
  {
    icon: Mail,
    title: "Email Us",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
  },
  {
    icon: MapPin,
    title: "Visit Us",
    value: SITE.address,
  },
];

const SOCIALS = [
  {
    icon: FaFacebookF,
    label: "Facebook",
    href: SITE.social.facebook,
    className: "bg-[#1769e0]",
  },
  {
    icon: FaWhatsapp,
    label: "WhatsApp",
    href: whatsappHref,
    className: "bg-[#25d366]",
  },
  {
    icon: FaInstagram,
    label: "Instagram",
    href: SITE.social.instagram,
    className:
      "bg-linear-to-br from-[#833ab4] via-[#e1306c] to-[#fcaf45]",
  },
  {
    icon: FaYoutube,
    label: "YouTube",
    href: SITE.social.youtube,
    className: "bg-[#e52b32]",
  },
];

const PROMISES = [
  { icon: Zap, label: "Quick Response" },
  { icon: Headphones, label: "Dedicated Support" },
  { icon: ShieldCheck, label: "Your Mobility Partner" },
];

const isReason = (value: string | undefined): value is ContactReason =>
  CONTACT_REASONS.includes(value as ContactReason);

export default async function ContactPage({
  searchParams,
}: PageProps<"/contact-us">) {
  const query = await searchParams;

  const reason = firstParam(query.reason);
  const message = firstParam(query.message)?.slice(0, 5000);

  return (
    <main className="min-h-screen w-full bg-[#06111F] text-white">
      <div className="mx-auto max-w-275 px-4 py-10 sm:px-6 sm:py-14">
        <div className="[&_.page-header-title]:text-white [&_.page-header-description]:text-gray-400 [&_.page-header-accent]:text-[#0057D9]">
          <PageHeader
            title={
              <>
                <span className="text-[#0057D9]">Contact</span>{" "}
                <span className="text-[#FF8A00]">Us</span>
              </>
            }
            description="We'd love to hear from you."
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1.1fr]">
          <Reveal className="space-y-3">
            {CHANNELS.map(({ icon: Icon, title, value, href }) => {
              const content = (
                <>
                  <Icon
                    className="h-6 w-6 shrink-0 text-[#0057D9]"
                    aria-hidden
                  />

                  <span>
                    <span className="block text-[15px] text-gray-300">
                      {title}
                    </span>

                    <span className="mt-0.5 block text-sm text-white">
                      {value}
                    </span>
                  </span>
                </>
              );

              const className =
                "flex min-h-17 items-center gap-4 rounded-lg border border-[#1d2b38] bg-[#0a141e] px-5 py-3";

              return href ? (
                <a
                  key={title}
                  href={href}
                  className={`${className} transition-colors hover:border-[#0057D9]/60`}
                >
                  {content}
                </a>
              ) : (
                <div key={title} className={className}>
                  {content}
                </div>
              );
            })}

            <div className="pt-3">
              <h2 className="mb-4 text-xl font-medium text-white">
                Follow <span className="text-[#FF8A00]">Us</span>
              </h2>

              <ul className="flex gap-3">
                {SOCIALS.map(({ icon: Icon, label, href, className }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform hover:-translate-y-0.5 ${className}`}
                    >
                      <Icon aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal
            delay={0.1}
            className="rounded-xl border border-[#1d2b38] bg-[#0a141e] p-5"
          >
            <ContactForm
              key={`${reason}|${message}`}
              initialReason={isReason(reason) ? reason : undefined}
              initialMessage={message}
            />
          </Reveal>
        </div>

        <ul className="mt-5 grid grid-cols-1 gap-4 rounded-lg border border-[#1d2b38] bg-[#0a141e] px-5 py-5 sm:grid-cols-3">
          {PROMISES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 sm:justify-center"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#FF8A00]">
                <Icon
                  className="h-4 w-4 text-[#FF8A00]"
                  aria-hidden
                />
              </span>

              <span className="text-[15px] text-gray-300">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}