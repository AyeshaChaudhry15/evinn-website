/** 195000 -> "PKR 195,000". A fixed locale keeps server and browser output identical. */
export function formatPKR(amount: number) {
  return `PKR ${amount.toLocaleString("en-US")}`;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Karachi",
});

/** ISO date -> "6 Oct 2026, 2:15 pm" in Pakistan time. */
export function formatDateTime(iso: string) {
  return dateFormatter.format(new Date(iso));
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
