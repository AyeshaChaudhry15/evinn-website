export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Electric Bikes", href: "/electric-bikes" },
  { label: "Electric Scooters", href: "/electric-scooters" },
  { label: "Brands", href: "/brands" },
  { label: "Compare", href: "/compare-vehicles" },
  { label: "About", href: "/about-us" },
  { label: "Blog", href: "/blog" },
] as const;

export function isActivePath(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}
