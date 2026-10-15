export type BusinessCategory =
  | 'STAY'
  | 'DINING'
  | 'TRANSPORT'
  | 'RENTAL'
  | 'ACTIVITY'
  | 'hotel'
  | 'resort'
  | 'homestay'
  | 'hostel'
  | 'restaurant'
  | 'cafe'
  | 'bakery'
  | 'cab'
  | 'taxi'
  | 'bike_rental'
  | 'car_rental'
  | 'tour_guide'
  | 'tour_operator'
  | 'activity_provider'
  | 'shop'
  | 'travel_agent'
  | 'photographer'
  | (string & {});
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REVOKED';

export interface Business {
  id: string;
  vendorId: string;
  businessName: string;
  category: BusinessCategory;
  description?: string;
  location?: any; 
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  whatsapp?: string;
  googleMapsUrl?: string;
  status: 'active' | 'suspended' | 'closed';
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  reviewCount?: number;
  media?: BusinessMedia[];
  offers?: BusinessOffer[];
  services?: BusinessService[];
  reviews?: BusinessReview[];
}

export interface BusinessMedia {
  id: string;
  businessId: string;
  url: string;
  provider: string;
  mediaType: 'image' | 'video' | 'logo' | 'cover';
  altText?: string;
  isCover?: boolean;
  sortOrder: number;
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  createdAt: string;
}

export interface BusinessOffer {
  id: string;
  businessId: string;
  title: string;
  description?: string;
  discountType: string;
  discountValue?: number;
  status: 'active' | 'inactive' | 'expired';
  startAt?: string;
  endAt?: string;
}

export interface BusinessService {
  id: string;
  businessId: string;
  name?: string;
  serviceName?: string;
  serviceType?: string;
  description?: string;
  priceMinor?: number;
  basePriceMinor?: number;
  currency?: string;
  priceUnit?: string;
  isAvailable?: boolean;
  maxCapacity?: number;
  imageUrl?: string;
  imageUrls?: string[];
  facilities?: string[];
  attributes?: Record<string, any>;
}

export interface MasterCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MasterItem {
  id: string;
  categoryId?: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface BusinessReview {
  id: string;
  businessId: string;
  travelerHash: string;
  rating: number;
  comment?: string;
  provenance: string;
  createdAt: string;
  vendorReply?: string;
}

export interface BookingRequest {
  id: string;
  bookingReference: string;
  businessId: string;
  travelerHash: string;
  status: 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';
  priceSnapshotMinor: number;
  currency: string;
  serviceId?: string;
  bookingDate: string;
  createdAt: string;
  businessName?: string;
  serviceName?: string;
}

export interface Reservation {
  id: string;
  bookingRequestId: string;
  bookingReference?: string;
  businessId?: string;
  businessName?: string;
  businessAddress?: string;
  businessCity?: string;
  businessCountry?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  phone?: string;
  serviceName?: string;
  priceMinor?: number;
  currency?: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  vendorConfirmedAt: string;
  bookingDate?: string;
}

export interface Vendor {
  id: string;
  email: string;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED';
}
