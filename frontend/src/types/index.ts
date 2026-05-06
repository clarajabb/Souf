export type Role = 'SUPPLIER' | 'BUYER';
export type MaterialType = 'WOOL' | 'COTTON' | 'LINEN' | 'SILK' | 'LEATHER' | 'CASHMERE' | 'ALPACA' | 'OTHER';
export type ListingStatus = 'ACTIVE' | 'SOLD_OUT' | 'PAUSED';
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'DISPUTED' | 'CANCELLED';
export type SampleStatus = 'PENDING' | 'ACCEPTED' | 'SHIPPED' | 'RECEIVED';
export type FarmingPractice = 'ORGANIC' | 'CONVENTIONAL' | 'FREE_RANGE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  country?: string;
  phone?: string;
  avatarUrl?: string;
  isVerified: boolean;
  language: string;
  createdAt: string;
  supplierProfile?: SupplierProfile;
}

export interface SupplierProfile {
  id: string;
  userId: string;
  farmName: string;
  description: string;
  location: string;
  region?: string;
  lat?: number;
  lng?: number;
  farmingPractice: FarmingPractice;
  certifications: string[];
  totalSales: number;
  rating: number;
  createdAt: string;
}

export interface Listing {
  id: string;
  supplierId: string;
  title: string;
  materialType: MaterialType;
  description: string;
  pricePerKg: number;
  minimumOrderKg: number;
  availableKg: number;
  images: string[];
  status: ListingStatus;
  allowSamples: boolean;
  samplePriceUsd?: number;
  createdAt: string;
  supplier?: User & { supplierProfile?: SupplierProfile };
}

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  supplierId: string;
  quantityKg: number;
  totalPriceUsd: number;
  status: OrderStatus;
  stripePaymentIntentId?: string;
  createdAt: string;
  listing?: Partial<Listing>;
  buyer?: Partial<User>;
  supplier?: Partial<User>;
  reviews?: Review[];
}

export interface SampleRequest {
  id: string;
  listingId: string;
  buyerId: string;
  supplierId: string;
  status: SampleStatus;
  paidAt?: string;
  createdAt: string;
  listing?: Partial<Listing>;
  buyer?: Partial<User>;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  orderId?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: Partial<User>;
}

export interface Conversation {
  partner: Partial<User>;
  latestMessage: Message;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  targetUserId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer?: Partial<User>;
  order?: Partial<Order>;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  pages: number;
}

export interface ListingFilters {
  materialType?: MaterialType | '';
  country?: string;
  minPrice?: string;
  maxPrice?: string;
  allowSamples?: boolean;
  minQuantity?: string;
  page?: number;
}
