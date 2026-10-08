export type ObjectId = string;
export type ISODate = string;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Brand {
  _id: ObjectId;
  displayName: string;
  logoUrl: string;
  logoPublicId: string;
  origin: string;
  established: string;
  headquarters: string;
  about: string;
  websiteUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  facebookUrl: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type BrandSummary = Pick<Brand, "_id" | "displayName" | "logoUrl">;

export type BikeType = "bike" | "scooter";

export interface BikeSpecs {
  range: string;
  topSpeed: string;
  battery: string;
  chargingTime: string;
  motorPower: string;
  weight: string;
  warranty: string;
}

export interface Bike {
  _id: ObjectId;
  name: string;
  slug: string;
  brand: BrandSummary;
  type: BikeType;
  price: number;
  rating: number;
  imageUrl: string;
  imagePublicId: string;
  specs: BikeSpecs;
  topSpeedKmh: number | null;
  rangeKm: number | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Accessory {
  _id: ObjectId;
  name: string;
  slug: string;
  price: number;
  priceText: string;
  imageUrl: string;
  imagePublicId: string;
  description: string;
  features: string[];
  inStock: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type SparePart = Accessory;

export const CONTACT_REASONS = [
  "Product Inquiry",
  "Business Inquiry",
  "Support",
  "General Inquiry",
] as const;

export type ContactReason = (typeof CONTACT_REASONS)[number];

export interface ContactFormInput {
  fullName: string;
  email: string;
  reason: ContactReason;
  message?: string;
}

export interface TestRideRequestInput {
  requesterName: string;
  requesterEmail: string;
  requesterWhatsApp: string;
  brand: ObjectId;
  bike: ObjectId;
  preferredCity: string;
  preferredDate: string;
  preferredTime: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "delivered"
  | "completed"
  | "cancelled"
  | "rejected";

export type PaymentMethod = "cash on delivery";

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  address: string;
  postalCode: string;
  city: string;
}

export interface PlaceOrderInput {
  bike: ObjectId;
  quantity: number;
  shippingAddress: ShippingAddress;
  paymentMethod?: PaymentMethod;
}

export interface PlacedOrder {
  _id: ObjectId;
  bike: ObjectId;
  bikeName: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  nextStatuses: OrderStatus[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface BrandListResponse {
  brands: Brand[];
}
export interface BrandResponse {
  brand: Brand;
}
export interface BikeListResponse {
  bikes: Bike[];
  pagination: Pagination;
}
export interface BikeResponse {
  bike: Bike;
}
export interface AccessoryListResponse {
  accessories: Accessory[];
  pagination: Pagination;
}
export interface AccessoryResponse {
  accessory: Accessory;
}
export interface SparePartListResponse {
  spareParts: SparePart[];
  pagination: Pagination;
}
export interface SparePartResponse {
  sparePart: SparePart;
}
export interface MessageResponse {
  message: string;
}
export interface PlaceOrderResponse {
  message: string;
  order: PlacedOrder;
}

export interface PageQuery {
  page?: number;
  limit?: number;
}

export interface BikeListQuery extends PageQuery {
  search?: string;
  brand?: string;
  type?: BikeType;
  minPrice?: number;
  maxPrice?: number;
  minTopSpeed?: number;
  maxTopSpeed?: number;
  minRange?: number;
  maxRange?: number;
}

export interface StockListQuery extends PageQuery {
  inStock?: boolean;
}
