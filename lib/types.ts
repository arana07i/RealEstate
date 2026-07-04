export type PricingTier = "starter" | "professional" | "enterprise";

export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout';

export interface Agency {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
  subscription_tier: PricingTier;
  subscription_status: "active" | "trialing" | "past_due" | "canceled";
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
}

export type ListingStatus = "active" | "sold";
export type InquiryStatus = "new" | "contacted" | "closed" | "spam";

export interface Listing {
  id: string;
  agency_id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  image_urls: string[];
  status: ListingStatus;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  featured: boolean;
  draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingFormData {
  agency_id?: string;
  title: string;
  description: string;
  price: number;
  location: string;
  image_urls: string[];
  status: ListingStatus;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  featured: boolean;
  draft: boolean;
}

export interface ListingFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ListingStatus;
  featured?: boolean;
}

export interface Inquiry {
  id: string;
  agency_id: string;
  property_id: string | null;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
  property?: { title: string; location: string };
}

export interface InquiryFormData {
  property_id?: string | null;
  name: string;
  email: string;
  phone: string;
  message: string;
}