import {
  getAccessories,
  getAccessory,
  getSparePart,
  getSpareParts,
} from "@/lib/catalog";

export const PRODUCT_KINDS = {
  accessories: {
    basePath: "/accessories",
    title: "Accessories",
    singular: "accessory",
    description: "Enhance your ride with premium accessories.",
    list: getAccessories,
    get: getAccessory,
  },
  "spare-parts": {
    basePath: "/spare-parts",
    title: "Spare Parts",
    singular: "spare part",
    description: "Genuine replacement parts to keep your EV running like new.",
    list: getSpareParts,
    get: getSparePart,
  },
} as const;

export type ProductKind = keyof typeof PRODUCT_KINDS;
