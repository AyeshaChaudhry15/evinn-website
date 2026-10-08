import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bike as BikeIcon, ExternalLink, Info } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { BikeGrid } from "@/components/catalog/bike-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Reveal } from "@/components/ui/reveal";
import { container } from "@/components/ui/styles";
import { errorMessage } from "@/lib/api";
import { getBikes, getBrand } from "@/lib/catalog";
import { BIKES_PER_PAGE, pageParam } from "@/lib/search-params";

export async function generateMetadata({ params }: PageProps<"/brands/[id]">): Promise<Metadata> {
  const brand = await getBrand((await params).id);
  if (!brand) return { title: "Brand not found" };

  return {
    title: `${brand.displayName} Electric Bikes & Scooters`,
    description: brand.about || `Electric bikes and scooters by ${brand.displayName}.`,
  };
}

export default async function BrandPage({ params, searchParams }: PageProps<"/brands/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const brand = await getBrand(id);
  if (!brand) notFound();

  const models = await getBikes({ brand: brand._id, page: pageParam(query.page), limit: BIKES_PER_PAGE }).then(
    (data) => ({ data, error: null }),
    (error: unknown) => ({ data: null, error: errorMessage(error) }),
  );

  const facts = [
    { label: "Origin", value: brand.origin },
    { label: "Established", value: brand.established },
    { label: "Headquarters", value: brand.headquarters },
  ].filter((fact) => fact.value);

  const links = [
    { label: "Facebook", href: brand.facebookUrl, icon: FaFacebookF },
    { label: "Instagram", href: brand.instagramUrl, icon: FaInstagram },
    { label: "X (Twitter)", href: brand.twitterUrl, icon: FaXTwitter },
  ].filter((link) => link.href);

  return (
    <div className={`${container} py-10 lg:py-14`}>
      <Link
        href="/brands"
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-soft transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        All Brands
      </Link>

      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
        <Reveal className="h-fit rounded-2xl border border-line bg-ink-900 p-6 sm:p-8 lg:sticky lg:top-24">
          <div className="relative mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-xl bg-white">
            {brand.logoUrl ? (
              <Image src={brand.logoUrl} alt={`${brand.displayName} logo`} fill sizes="144px" className="object-contain p-3" />
            ) : (
              <span className="text-2xl font-bold text-ink-950">{brand.displayName.slice(0, 2)}</span>
            )}
          </div>

          <h1 className="mt-6 text-center text-3xl font-bold text-white">{brand.displayName}</h1>

          {facts.length > 0 && (
            <dl className="mt-8 space-y-4 text-sm">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-faint">{fact.label}</dt>
                  <dd className="mt-1 text-fg">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {(brand.websiteUrl || links.length > 0) && (
            <div className="mt-8 flex flex-wrap gap-2">
              {brand.websiteUrl && (
                <a
                  href={brand.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-hover"
                >
                  Website <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {links.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-soft transition-colors hover:border-brand hover:text-brand"
                >
                  <Icon aria-hidden />
                </a>
              ))}
            </div>
          )}
        </Reveal>

        <div className="min-w-0">
          {brand.about && (
            <Reveal className="mb-10 rounded-2xl border border-line bg-ink-900 p-6 sm:p-8">
              <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-white">
                <Info className="h-6 w-6 text-brand" aria-hidden />
                About {brand.displayName}
              </h2>
              <p className="whitespace-pre-line leading-8 text-soft">{brand.about}</p>
            </Reveal>
          )}

          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
            <BikeIcon className="h-6 w-6 text-brand" aria-hidden />
            {brand.displayName} Models
            {models.data && (
              <span className="text-base font-medium text-muted">({models.data.pagination.total})</span>
            )}
          </h2>

          {models.error || !models.data ? (
            <EmptyState tone="error" title="We couldn't load models" description={models.error} />
          ) : models.data.bikes.length === 0 ? (
            <EmptyState
              icon={<BikeIcon className="h-7 w-7" />}
              title="No models available yet"
              description={`Check back soon for ${brand.displayName} bikes and scooters.`}
            />
          ) : (
            <>
              <BikeGrid bikes={models.data.bikes} className="xl:grid-cols-3" />
              <Pagination
                pagination={models.data.pagination}
                pathname={`/brands/${brand._id}`}
                searchParams={query}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
