import Link from "next/link";
import { PackageSearch } from "lucide-react";
import {
  PRODUCT_KINDS,
  type ProductKind,
} from "@/components/catalog/product-kinds";
import { ProductCard } from "@/components/catalog/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Reveal } from "@/components/ui/reveal";
import { container } from "@/components/ui/styles";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import {
  firstParam,
  hrefWith,
  pageParam,
  PRODUCTS_PER_PAGE,
  type SearchParams,
} from "@/lib/search-params";

interface ProductCatalogProps {
  kind: ProductKind;
  searchParams: SearchParams;
}

export async function ProductCatalog({
  kind,
  searchParams,
}: ProductCatalogProps) {
  const config = PRODUCT_KINDS[kind];
  const inStockOnly = firstParam(searchParams.inStock) === "true";

  const result = await config
    .list({
      page: pageParam(searchParams.page),
      limit: PRODUCTS_PER_PAGE,
      inStock: inStockOnly || undefined,
    })
    .then(
      (data) => ({ data, error: null }),
      (error: unknown) => ({ data: null, error: errorMessage(error) }),
    );

  const tabs = [
    { label: "All", href: hrefWith(config.basePath, {}), active: !inStockOnly },
    {
      label: "In stock",
      href: hrefWith(config.basePath, {}, { inStock: "true" }),
      active: inStockOnly,
    },
  ];

  return (
    <div className={`${container} py-10 lg:py-14`}>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <nav
            aria-label="Stock filter"
            className="flex gap-1 rounded-lg border border-line bg-ink-900 p-1"
          >
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  tab.active
                    ? "bg-brand text-ink-950"
                    : "text-soft hover:text-white",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        }
      />

      {result.error || !result.data ? (
        <EmptyState
          tone="error"
          title={`We couldn't load ${config.title.toLowerCase()}`}
          description={result.error}
        />
      ) : result.data.items.length === 0 ? (
        <EmptyState
          icon={<PackageSearch className="h-7 w-7" />}
          title={`No ${config.title.toLowerCase()} found`}
          description={
            inStockOnly
              ? "Nothing is in stock right now. Try showing all items."
              : "Check back soon."
          }
        />
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {result.data.items.map((product, index) => (
              <Reveal
                key={product._id}
                as="li"
                delay={Math.min(index, 7) * 0.04}
              >
                <ProductCard
                  product={product}
                  href={`${config.basePath}/${product.slug}`}
                />
              </Reveal>
            ))}
          </ul>
          <Pagination
            pagination={result.data.pagination}
            pathname={config.basePath}
            searchParams={searchParams}
          />
        </>
      )}
    </div>
  );
}
