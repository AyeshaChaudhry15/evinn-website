"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingCart, X } from "lucide-react";
import { NavSearch } from "@/components/layout/nav-search";
import { isActivePath, NAV_LINKS } from "@/components/layout/nav-links";
import { useCartCount } from "@/lib/cart";
import { cn } from "@/lib/cn";

function CartLink() {
  const count = useCartCount();

  return (
    <Link
      href="/cart"
      aria-label={
        count > 0 ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart"
      }
      className="relative flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:text-brand"
    >
      <ShoppingCart className="h-5 w-5" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-ink-950"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-night/95 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          className="text-xl font-bold tracking-tight"
          aria-label="EVINN home"
        >
          <span className="text-white">EV</span>
          <span className="text-brand">INN</span>
        </Link>

        <ul className="hidden items-center gap-6 text-[15px] font-medium text-gray-300 xl:flex">
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "transition-colors hover:text-brand",
                    active && "text-brand",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2 text-gray-300 sm:gap-3">
          <NavSearch />
          <CartLink />
          <Link
            href="/contact-us"
            className="hidden rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-hover xl:block"
          >
            Contact Us
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-200 xl:hidden"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/5 bg-night xl:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 py-4 text-sm font-medium text-gray-300 sm:px-6">
              {NAV_LINKS.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-md px-2 py-2.5 transition-colors hover:bg-white/5 hover:text-brand",
                        active && "text-brand",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li className="pt-2">
                <Link
                  href="/contact-us"
                  className="block rounded-lg bg-brand px-5 py-2.5 text-center font-semibold text-ink-950"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
