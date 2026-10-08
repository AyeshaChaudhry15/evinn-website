import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageCircle, Phone } from "lucide-react";
import {
  PRODUCT_KINDS,
  type ProductKind,
} from "@/components/catalog/product-kinds";
import { ProductImage } from "@/components/ui/product-image";
import { Reveal } from "@/components/ui/reveal";
import {
  buttonPrimary,
  buttonSecondary,
  container,
} from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { telHref } from "@/data/site";
import type { Accessory } from "@/types/api";

interface ProductDetailProps {
  kind: ProductKind;
  product: Accessory;
}

export function ProductDetail({ kind, product }: ProductDetailProps) {
  const config = PRODUCT_KINDS[kind];
  const enquiry = new URLSearchParams({
    reason: "Product Inquiry",
    message: `Hi, I'd like to order the ${product.name} ${config.singular} (${product.priceText}). Please get in touch.`,
  });

  return (
    <div className={`${container} py-10 lg:py-14`}>
      <Link
        href={config.basePath}
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-soft transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {config.title}
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative h-80 overflow-hidden rounded-xl border border-line bg-ink-900 lg:h-125">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            preload
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="p-8 drop-shadow-xl"
          />
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-semibold text-brand">
            {product.priceText}
          </p>
          <p
            className={cn(
              "mt-3 text-sm font-semibold",
              product.inStock ? "text-brand" : "text-red-400",
            )}
          >
            {product.inStock ? "In stock" : "Currently out of stock"}
          </p>

          {product.description && (
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-gray-400">
              {product.description}
            </p>
          )}

          {product.features.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold text-brand">
                Key Features
              </h2>
              <ul className="space-y-2 text-sm text-gray-300">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/contact-us?${enquiry}`}
              className={cn(buttonPrimary, "flex-1 py-3.5")}
            >
              <MessageCircle className="h-4 w-4" />
              {product.inStock ? "Enquire to Order" : "Ask About Availability"}
            </Link>
            <a href={telHref} className={cn(buttonSecondary, "flex-1 py-3.5")}>
              <Phone className="h-4 w-4" />
              Call Us
            </a>
          </div>
          <p className="mt-3 text-xs text-faint">
            Our team will confirm price, availability and delivery for your
            city.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
